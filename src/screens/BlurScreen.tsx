import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Blur, Canvas, Group, Image as SkiaImage, Mask, Path, Skia, type SkImage } from '@shopify/react-native-skia';
import { Feather } from '@expo/vector-icons';
import { colors, radius, space } from '@/theme/tokens';
import { Button, EmptyPicker, Header, ImagePreview, ResultSheet, ScalePressable, Screen, Section, Slider, Text } from '@/ui';
import { convert, pickImages, type Picked, type Processed } from '@/lib/image';
import { readBytes } from '@/lib/files';
import { exportBlur, strokePath, type Stroke } from '@/lib/blur';
import { saveToPhotos, shareFile } from '@/lib/save';
import { outputName } from '@/lib/naming';
import { formatBytes, formatDims } from '@/lib/format';

const BRUSH_MIN = 8;
const BRUSH_MAX = 100;

const MAX_CANVAS_HEIGHT = 380;

export default function BlurScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const [image, setImage] = useState<Picked | null>(null);
  const [skImage, setSkImage] = useState<SkImage | null>(null);

  // Skia cannot decode HEIC and its URI loader rejects the picker's file:// paths, so the photo is
  // first normalised to a top-quality JPEG (which also bakes in EXIF orientation), then decoded from bytes.
  useEffect(() => {
    let cancelled = false;
    setSkImage(null);
    if (!image) return;
    convert(image.uri, 'jpg', 1)
      .then((jpeg) => readBytes(jpeg.uri))
      .then((bytes) => {
        if (cancelled) return;
        const decoded = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBytes(bytes));
        if (!decoded) throw new Error('Unsupported image data');
        setSkImage(decoded);
      })
      .catch((e) => Alert.alert('Could not load the photo', e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, [image]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [strength, setStrength] = useState(0.5);
  const [brushT, setBrushT] = useState(0.4);
  const brush = Math.round(BRUSH_MIN + brushT * (BRUSH_MAX - BRUSH_MIN));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Processed | null>(null);

  // The photo is drawn contained inside a canvas that spans the content width.
  const layout = useMemo(() => {
    if (!image) return null;
    const w = Math.min(screenWidth, 560) - 40;
    const h = Math.min(MAX_CANVAS_HEIGHT, (w * image.height) / image.width);
    const s = Math.min(w / image.width, h / image.height);
    const dw = image.width * s;
    const dh = image.height * s;
    return { w, h, dw, dh, x: (w - dw) / 2, y: (h - dh) / 2, scale: image.width / dw };
  }, [image, screenWidth]);

  const sigma = 2 + strength * 30;
  const paths = useMemo(() => strokes.map((s) => strokePath(s.points)), [strokes]);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(0)
    .onBegin((e) => setStrokes((prev) => [...prev, { points: [{ x: e.x, y: e.y }], width: brush }]))
    .onUpdate((e) =>
      setStrokes((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        return [...prev.slice(0, -1), { ...last, points: [...last.points, { x: e.x, y: e.y }] }];
      }),
    );

  const pick = async () => {
    const [picked] = await pickImages();
    if (picked) {
      setImage(picked);
      setStrokes([]);
      setResult(null);
    }
  };

  const run = async () => {
    if (!image || !skImage || !layout) return;
    setBusy(true);
    try {
      setResult(await exportBlur({ image: skImage, strokes, sigma, origin: { x: layout.x, y: layout.y }, scale: layout.scale }));
    } catch (e) {
      Alert.alert('Could not blur the photo', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setImage(null);
    setStrokes([]);
    setResult(null);
  };

  return (
    <Screen
      scroll={!image || !!result}
      footer={image && !result ? <Button title={strokes.length ? 'Apply blur' : 'Paint over something first'} size="lg" loading={busy} disabled={!strokes.length || !skImage} onPress={run} /> : undefined}
    >
      <Header title="Blur" subtitle="Paint over anything to hide it" />

      {!image ? (
        <EmptyPicker title="Choose a photo" hint="Then paint with your finger over faces, plates or text." onPress={pick} />
      ) : result ? (
        <ImagePreview uri={result.uri} width={result.width} height={result.height} meta={`${formatDims(result.width, result.height)} · ${formatBytes(result.size)}`} />
      ) : layout ? (
        <Animated.View entering={ZoomIn.springify().damping(18).stiffness(180)} style={styles.stage}>
          <GestureDetector gesture={pan}>
            <Canvas style={{ width: layout.w, height: layout.h }}>
              <SkiaImage image={skImage} x={layout.x} y={layout.y} width={layout.dw} height={layout.dh} fit="contain" />
              <Mask
                mask={
                  <Group>
                    {paths.map((p, i) => (
                      <Path key={i} path={p} style="stroke" strokeWidth={strokes[i].width} strokeCap="round" strokeJoin="round" color="white" />
                    ))}
                  </Group>
                }
              >
                <SkiaImage image={skImage} x={layout.x} y={layout.y} width={layout.dw} height={layout.dh} fit="contain">
                  <Blur blur={sigma} />
                </SkiaImage>
              </Mask>
            </Canvas>
          </GestureDetector>
          <Animated.View entering={FadeIn.delay(120)} style={styles.stageBar}>
            <Text variant="bodySm" tone="mute">{strokes.length ? `${strokes.length} stroke${strokes.length > 1 ? 's' : ''}` : 'Drag to paint'}</Text>
            <View style={styles.stageActions}>
              <IconButton icon="corner-up-left" label="Undo" disabled={!strokes.length} onPress={() => setStrokes((s) => s.slice(0, -1))} />
              <IconButton icon="trash-2" label="Clear" disabled={!strokes.length} onPress={() => setStrokes([])} />
              <IconButton icon="refresh-cw" label="Photo" onPress={pick} />
            </View>
          </Animated.View>
        </Animated.View>
      ) : null}

      {image && !result ? (
        <>
          <Section label="Strength">
            <View style={styles.sliderRow}>
              <View style={{ flex: 1 }}>
                <Slider value={strength} onChange={setStrength} />
              </View>
              <Text variant="headingSm" style={styles.sliderValue}>{Math.round(strength * 100)}%</Text>
            </View>
          </Section>
          <Section label="Brush size" delay={40}>
            <View style={styles.sliderRow}>
              <View style={{ flex: 1 }}>
                <Slider value={brushT} onChange={setBrushT} />
              </View>
              <View style={styles.brushPreview}>
                <View style={[styles.brushDot, { width: brush * 0.4, height: brush * 0.4 }]} />
              </View>
              <Text variant="headingSm" style={styles.sliderValue}>{brush}</Text>
            </View>
          </Section>
        </>
      ) : null}

      {image && result ? (
        <ResultSheet
          title="Blurred"
          stats={[
            { label: 'Strokes', value: String(strokes.length) },
            { label: 'Strength', value: `${Math.round(strength * 100)}%` },
            { label: 'Size', value: formatBytes(result.size) },
          ]}
          filename={outputName('blur', 'jpg')}
          primary={{ title: 'Save to Photos', icon: 'download', onPress: () => saveToPhotos([{ uri: result.uri, name: outputName('blur', 'jpg') }]) }}
          secondary={{ title: 'Share', icon: 'share', onPress: () => shareFile({ uri: result.uri, name: outputName('blur', 'jpg') }) }}
          onReset={reset}
        />
      ) : null}
    </Screen>
  );
}

function IconButton({ icon, label, onPress, disabled }: { icon: keyof typeof Feather.glyphMap; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <ScalePressable onPress={onPress} disabled={disabled} style={[styles.iconBtn, disabled && { opacity: 0.35 }]} scaleTo={0.92} hitSlop={6}>
      <Feather name={icon} size={16} color={colors.onDark} />
      <Text variant="buttonSm">{label}</Text>
    </ScalePressable>
  );
}

const styles = StyleSheet.create({
  stage: { gap: space.sm },
  stageBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.xs },
  stageActions: { flexDirection: 'row', gap: space.xs },
  iconBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: radius.full, backgroundColor: colors.surface },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  sliderValue: { width: 60, textAlign: 'right' },
  brushPreview: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  brushDot: { borderRadius: radius.full, backgroundColor: colors.onDark },
});
