import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { colors, radius, space } from '@/theme/tokens';
import { Button, EmptyPicker, Header, ImagePreview, ResultSheet, Screen, Section, Slider, Text } from '@/ui';
import { compressToQuality, pickImages, type Picked, type Processed } from '@/lib/image';
import { saveToPhotos, shareFile } from '@/lib/save';
import { formatBytes, savings } from '@/lib/format';
import { outputName } from '@/lib/naming';

export default function Compress() {
  const [image, setImage] = useState<Picked | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [estimate, setEstimate] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Processed | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);

  // Live size estimate while the slider moves — re-encodes on device after a short pause.
  useEffect(() => {
    if (!image || result) return;
    if (timer.current) clearTimeout(timer.current);
    const gen = ++generation.current;
    timer.current = setTimeout(async () => {
      try {
        const p = await compressToQuality(image.uri, quality);
        if (gen === generation.current) setEstimate(p.size);
      } catch {
        /* estimate is best-effort */
      }
    }, 220);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [image, quality, result]);

  const pick = async () => {
    const [picked] = await pickImages();
    if (picked) {
      setImage(picked);
      setResult(null);
      setEstimate(null);
    }
  };

  const run = async () => {
    if (!image) return;
    setBusy(true);
    try {
      setResult(await compressToQuality(image.uri, quality));
    } catch (e) {
      Alert.alert('Compression failed', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setEstimate(null);
  };

  return (
    <Screen footer={image && !result ? <Button title={`Compress${estimate ? ` · ≈ ${formatBytes(estimate)}` : ''}`} size="lg" loading={busy} onPress={run} /> : undefined}>
      <Header title="Compress" subtitle="Smaller files, same photo" />

      {!image ? (
        <EmptyPicker title="Choose a photo" hint="Drag the quality down and watch the file size follow." onPress={pick} />
      ) : (
        <ImagePreview
          uri={result?.uri ?? image.uri}
          width={image.width}
          height={image.height}
          meta={`${image.format} · ${formatBytes(image.size)}`}
          onReplace={result ? undefined : pick}
        />
      )}

      {image && !result ? (
        <Section label="Quality">
          <View style={styles.sliderCard}>
            <View style={styles.sliderHead}>
              <Text variant="headingMd">{Math.round(quality * 100)}%</Text>
              <Animated.View layout={LinearTransition}>
                <Text variant="bodySm" tone="mute">
                  {formatBytes(image.size)} → {estimate ? formatBytes(estimate) : '…'}
                  {estimate ? <Text variant="bodySm" tone="success">  {savings(image.size, estimate)}</Text> : null}
                </Text>
              </Animated.View>
            </View>
            <Slider value={quality} onChange={setQuality} />
            <View style={styles.sliderLabels}>
              <Text variant="caption" tone="faint">Smaller</Text>
              <Text variant="caption" tone="faint">Sharper</Text>
            </View>
          </View>
        </Section>
      ) : null}

      {image && result ? (
        <ResultSheet
          title="Compressed"
          stats={[
            { label: 'Before', value: formatBytes(image.size) },
            { label: 'After', value: formatBytes(result.size) },
            { label: 'Saved', value: savings(image.size, result.size), tone: 'success' },
          ]}
          filename={outputName('compress', 'jpg')}
          primary={{ title: 'Save to Photos', icon: 'download', onPress: () => saveToPhotos([{ uri: result.uri, name: outputName('compress', 'jpg') }]) }}
          secondary={{ title: 'Share', icon: 'share', onPress: () => shareFile({ uri: result.uri, name: outputName('compress', 'jpg') }) }}
          onReset={reset}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sliderCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.xl, gap: space.sm },
  sliderHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
});
