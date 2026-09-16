import { useState } from 'react';
import { Alert } from 'react-native';
import { Button, EmptyPicker, Header, ImagePreview, ResultSheet, Screen, Section, Segmented, Text, ThumbStrip } from '@/ui';
import { convert, pickImages, type OutputFormat, type Picked, type Processed } from '@/lib/image';
import { imagesToPdf, type PdfResult } from '@/lib/pdf';
import { saveToPhotos, shareFile } from '@/lib/save';
import { formatBytes, formatDims } from '@/lib/format';
import { outputName } from '@/lib/naming';

type Format = OutputFormat | 'pdf';
type Result = { kind: 'images'; items: Processed[] } | { kind: 'pdf'; pdf: PdfResult };

const formats: { key: Format; label: string }[] = [
  { key: 'jpg', label: 'JPG' },
  { key: 'png', label: 'PNG' },
  { key: 'pdf', label: 'PDF' },
];

export default function Convert() {
  const [images, setImages] = useState<Picked[]>([]);
  const [format, setFormat] = useState<Format>('jpg');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const pick = async () => {
    const picked = await pickImages({ multiple: true, limit: 20 });
    if (picked.length) {
      setImages(picked);
      setResult(null);
    }
  };

  const run = async () => {
    setBusy(true);
    try {
      if (format === 'pdf') {
        setResult({ kind: 'pdf', pdf: await imagesToPdf(images.map((i) => i.uri)) });
      } else {
        const items: Processed[] = [];
        for (const img of images) items.push(await convert(img.uri, format));
        setResult({ kind: 'images', items });
      }
    } catch (e) {
      Alert.alert('Conversion failed', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setImages([]);
    setResult(null);
  };

  const totalIn = images.reduce((s, i) => s + i.size, 0);
  const first = images[0];
  const label = images.length > 1 ? `Convert ${images.length} photos` : 'Convert';

  return (
    <Screen
      footer={
        images.length && !result ? (
          <Button title={busy ? 'Converting…' : `${label} to ${format.toUpperCase()}`} size="lg" loading={busy} onPress={run} />
        ) : undefined
      }
    >
      <Header title="Convert" subtitle="HEIC · JPG · PNG · PDF" />

      {images.length === 0 ? (
        <EmptyPicker title="Choose photos" hint="Pick one or several. HEIC from iPhone works out of the box." onPress={pick} />
      ) : images.length === 1 ? (
        <ImagePreview
          uri={first.uri}
          width={first.width}
          height={first.height}
          meta={`${first.format} · ${formatDims(first.width, first.height)} · ${formatBytes(first.size)}`}
          onReplace={result ? undefined : pick}
        />
      ) : (
        <ThumbStrip images={images} meta={`${images.length} photos · ${formatBytes(totalIn)}`} onChange={result ? undefined : pick} />
      )}

      {images.length > 0 && !result ? (
        <Section label="Output format">
          <Segmented options={formats} value={format} onChange={setFormat} />
          <Text variant="caption" tone="faint">
            {format === 'pdf'
              ? 'One photo per A4 page, in the order you picked them.'
              : format === 'png'
                ? 'Lossless. Larger files, keeps transparency.'
                : 'Lossy, small files. Best for photos.'}
          </Text>
        </Section>
      ) : null}

      {result?.kind === 'images' ? (
        <ResultSheet
          title={result.items.length > 1 ? `${result.items.length} photos converted` : 'Converted'}
          stats={[
            { label: 'Format', value: format.toUpperCase() },
            { label: 'Before', value: formatBytes(totalIn) },
            { label: 'After', value: formatBytes(result.items.reduce((s, i) => s + i.size, 0)) },
          ]}
          filename={outputName('convert', format, 0, result.items.length)}
          primary={{
            title: 'Save to Photos',
            icon: 'download',
            onPress: () => saveToPhotos(result.items.map((it, i) => ({ uri: it.uri, name: outputName('convert', format, i, result.items.length) }))),
          }}
          secondary={result.items.length === 1 ? { title: 'Share', icon: 'share', onPress: () => shareFile({ uri: result.items[0].uri, name: outputName('convert', format) }) } : undefined}
          onReset={reset}
        />
      ) : null}

      {result?.kind === 'pdf' ? (
        <ResultSheet
          title="PDF ready"
          stats={[
            { label: 'Pages', value: String(result.pdf.pages) },
            { label: 'Size', value: formatBytes(result.pdf.size) },
          ]}
          filename={outputName('convert', 'pdf')}
          primary={{
            title: 'Save or share PDF',
            icon: 'share',
            onPress: () => shareFile({ uri: result.pdf.uri, name: outputName('convert', 'pdf') }, { mimeType: 'application/pdf', uti: 'com.adobe.pdf' }),
          }}
          onReset={reset}
        />
      ) : null}
    </Screen>
  );
}
