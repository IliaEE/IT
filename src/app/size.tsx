import { useState } from 'react';
import { Alert, Platform, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { colors, font, radius, space } from '@/theme/tokens';
import { Button, Chip, EmptyPicker, Header, ImagePreview, ProgressBar, ResultSheet, Screen, Section, Segmented, Text, ThumbStrip, useFitCanvas } from '@/ui';
import { containBox, fileSize, padOnWeb, pickImages, resize, type Picked, type Processed } from '@/lib/image';
import { applyDpi } from '@/lib/dpi';
import { saveToPhotos, shareFile } from '@/lib/save';
import { formatBytes, formatDims } from '@/lib/format';
import { outputName } from '@/lib/naming';

type Mode = 'resize' | 'fit';
type Dims = { width: number; height: number };
type Preset = { key: string; label: string; percent?: number; longest?: number };
type Ratio = { key: string; label: string; w: number; h: number };

const presets: Preset[] = [
  { key: '100', label: 'Original', percent: 1 },
  { key: '75', label: '75%', percent: 0.75 },
  { key: '50', label: '50%', percent: 0.5 },
  { key: '25', label: '25%', percent: 0.25 },
  { key: 'hd', label: 'HD 1280', longest: 1280 },
  { key: 'fhd', label: 'FHD 1920', longest: 1920 },
  { key: '4k', label: '4K 3840', longest: 3840 },
];

const ratios: Ratio[] = [
  { key: '1:1', label: 'Square 1:1', w: 1, h: 1 },
  { key: '4:5', label: 'Portrait 4:5', w: 4, h: 5 },
  { key: '9:16', label: 'Story 9:16', w: 9, h: 16 },
  { key: '16:9', label: 'Wide 16:9', w: 16, h: 9 },
  { key: '3:4', label: '3:4', w: 3, h: 4 },
  { key: '4:3', label: '4:3', w: 4, h: 3 },
];

const dpis = [72, 150, 300];
const MAX_SIDE = 3000;

export default function Size() {
  const [images, setImages] = useState<Picked[]>([]);
  const [mode, setMode] = useState<Mode>('resize');
  const [preset, setPreset] = useState('100');
  const [custom, setCustom] = useState<{ w: string; h: string }>({ w: '', h: '' });
  const [ratio, setRatio] = useState('1:1');
  const [background, setBackground] = useState<'#ffffff' | '#000000'>('#ffffff');
  const [dpi, setDpi] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Processed[] | null>(null);
  const canvas = useFitCanvas();

  // The same rule is applied to every photo in the batch, so targets are computed per image.
  const resizeTarget = (img: Dims): Dims | null => {
    if (preset === 'custom') {
      const w = parseInt(custom.w, 10);
      const h = parseInt(custom.h, 10);
      if (w > 0 && !(h > 0)) return { width: w, height: Math.round((w * img.height) / img.width) };
      if (h > 0 && !(w > 0)) return { width: Math.round((h * img.width) / img.height), height: h };
      if (w > 0 && h > 0) return { width: w, height: h };
      return null;
    }
    const p = presets.find((x) => x.key === preset)!;
    if (p.percent) return { width: Math.round(img.width * p.percent), height: Math.round(img.height * p.percent) };
    const s = Math.min(1, p.longest! / Math.max(img.width, img.height));
    return { width: Math.round(img.width * s), height: Math.round(img.height * s) };
  };

  const fitTarget = (img: Dims): Dims => {
    const r = ratios.find((x) => x.key === ratio)!;
    const want = r.w / r.h;
    let { width, height } = img;
    if (want >= width / height) width = Math.round(height * want);
    else height = Math.round(width / want);
    const s = Math.min(1, MAX_SIDE / Math.max(width, height));
    return { width: Math.round(width * s), height: Math.round(height * s) };
  };

  const pick = async () => {
    const picked = await pickImages({ multiple: true, limit: 20 });
    if (picked.length) {
      setImages(picked);
      setResults(null);
      setPreset('100');
    }
  };

  const run = async () => {
    if (!images.length) return;
    setBusy(true);
    setProgress(0);
    try {
      const out: Processed[] = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        let p: Processed;
        if (mode === 'resize') {
          const target = resizeTarget(img);
          if (!target) throw new Error('Enter a width or a height');
          p = await resize(img.uri, { ...target, format: img.format === 'PNG' ? 'png' : 'jpg' });
        } else {
          const target = fitTarget(img);
          p = Platform.OS === 'web' ? await padOnWeb(img.uri, target, containBox(img, target), background) : await canvas.fit(img.uri, target, background);
        }
        if (dpi) {
          const uri = await applyDpi(p.uri, dpi, p.format);
          p = { ...p, uri, size: await fileSize(uri) };
        }
        out.push(p);
        setProgress((i + 1) / images.length);
      }
      setResults(out);
    } catch (e) {
      Alert.alert('Could not process the photo', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setImages([]);
    setResults(null);
  };

  const first = images[0];
  const preview = first ? (mode === 'resize' ? resizeTarget(first) : fitTarget(first)) : null;
  const many = images.length > 1;
  const count = many ? `${images.length} photos` : '';
  const cta =
    mode === 'resize'
      ? preview
        ? many ? `Resize ${count}` : `Resize to ${preview.width} × ${preview.height}`
        : 'Enter a size'
      : `Fit ${count || 'photo'} to ${ratio}`;
  const totalOut = results?.reduce((s, r) => s + r.size, 0) ?? 0;

  return (
    <Screen footer={images.length && !results ? <Button title={cta} size="lg" loading={busy} disabled={!preview} onPress={run} /> : undefined}>
      <Header title="Image Size" subtitle="Resize · Fit to ratio · DPI" />
      {canvas.element}

      {!first ? (
        <EmptyPicker title="Choose photos" hint="One photo, or a batch — the same size applies to all of them." onPress={pick} />
      ) : many && !results ? (
        <ThumbStrip images={images} meta={`${images.length} photos · ${formatBytes(images.reduce((s, i) => s + i.size, 0))}`} onChange={pick} />
      ) : (
        <ImagePreview
          uri={results?.[0].uri ?? first.uri}
          width={results?.[0].width ?? first.width}
          height={results?.[0].height ?? first.height}
          meta={
            results
              ? many
                ? `${results.length} photos · ${formatBytes(totalOut)}`
                : `${formatDims(results[0].width, results[0].height)} · ${formatBytes(results[0].size)}${dpi ? ` · ${dpi} DPI` : ''}`
              : `${first.format} · ${formatDims(first.width, first.height)} · ${formatBytes(first.size)}`
          }
          onReplace={results ? undefined : pick}
        />
      )}

      {first && !results ? (
        <>
          <Section label="Mode">
            <Segmented
              options={[
                { key: 'resize', label: 'Resize' },
                { key: 'fit', label: 'Fit to ratio' },
              ]}
              value={mode}
              onChange={setMode}
            />
          </Section>

          {mode === 'resize' ? (
            <Section label="Size" delay={40}>
              <View style={styles.wrap}>
                {presets.map((p) => (
                  <Chip key={p.key} label={p.label} selected={preset === p.key} onPress={() => setPreset(p.key)} />
                ))}
                <Chip label="Custom" selected={preset === 'custom'} onPress={() => setPreset('custom')} />
              </View>
              {preset === 'custom' ? (
                <Animated.View entering={FadeIn} layout={LinearTransition} style={styles.inputs}>
                  <Field label="Width" value={custom.w} onChange={(w) => setCustom({ w, h: '' })} />
                  <Text variant="bodyMd" tone="faint">×</Text>
                  <Field label="Height" value={custom.h} onChange={(h) => setCustom({ w: '', h })} />
                </Animated.View>
              ) : null}
              {preview ? (
                <Text variant="caption" tone="faint">
                  {many ? `First photo → ${preview.width} × ${preview.height} px, others scaled the same way` : `Output ${preview.width} × ${preview.height} px`}
                </Text>
              ) : null}
            </Section>
          ) : (
            <>
              <Section label="Aspect ratio" delay={40}>
                <View style={styles.wrap}>
                  {ratios.map((r) => (
                    <Chip key={r.key} label={r.label} selected={ratio === r.key} onPress={() => setRatio(r.key)} />
                  ))}
                </View>
                {preview ? <Text variant="caption" tone="faint">Canvas {preview.width} × {preview.height} px, photo centered, nothing cropped</Text> : null}
              </Section>
              <Section label="Background" delay={80}>
                <View style={styles.wrap}>
                  <Chip label="White" selected={background === '#ffffff'} onPress={() => setBackground('#ffffff')} />
                  <Chip label="Black" selected={background === '#000000'} onPress={() => setBackground('#000000')} />
                </View>
              </Section>
            </>
          )}

          <Section label="DPI" delay={120}>
            <View style={styles.wrap}>
              <Chip label="Keep" selected={dpi === null} onPress={() => setDpi(null)} />
              {dpis.map((d) => (
                <Chip key={d} label={`${d} DPI`} selected={dpi === d} onPress={() => setDpi(d)} />
              ))}
            </View>
            <Text variant="caption" tone="faint">Print resolution written into the file. Pixels stay the same.</Text>
            {busy && many ? <ProgressBar value={progress} /> : null}
          </Section>
        </>
      ) : null}

      {first && results ? (
        <ResultSheet
          title={mode === 'resize' ? (many ? `${results.length} photos resized` : 'Resized') : many ? `${results.length} photos fitted` : 'Fitted'}
          stats={
            many
              ? [
                  { label: 'Photos', value: String(results.length) },
                  { label: 'First', value: formatDims(results[0].width, results[0].height) },
                  { label: 'Total', value: formatBytes(totalOut) },
                ]
              : [
                  { label: 'Before', value: formatDims(first.width, first.height) },
                  { label: 'After', value: formatDims(results[0].width, results[0].height) },
                  { label: dpi ? 'DPI' : 'Size', value: dpi ? String(dpi) : formatBytes(results[0].size) },
                ]
          }
          filename={outputName(mode, results[0].format, 0, results.length)}
          primary={{
            title: many ? 'Save all to Photos' : 'Save to Photos',
            icon: 'download',
            onPress: () => saveToPhotos(results.map((r, i) => ({ uri: r.uri, name: outputName(mode, r.format, i, results.length) }))),
          }}
          secondary={many ? undefined : { title: 'Share', icon: 'share', onPress: () => shareFile({ uri: results[0].uri, name: outputName(mode, results[0].format) }) }}
          onReset={reset}
        />
      ) : null}
    </Screen>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.field}>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        placeholder={label}
        placeholderTextColor={colors.onDarkFaint}
        style={styles.input}
        maxLength={5}
      />
      <Text variant="caption" tone="faint">px</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  inputs: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  input: { flex: 1, fontFamily: font.medium, fontSize: 18, color: colors.onDark },
});
