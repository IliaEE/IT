import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat, type ImageResult } from 'expo-image-manipulator';
import { extensionOf } from './format';

export type Picked = {
  uri: string;
  width: number;
  height: number;
  size: number;
  name: string;
  format: string; // e.g. HEIC, JPG, PNG
};

export type OutputFormat = 'jpg' | 'png';

export type Processed = {
  uri: string;
  width: number;
  height: number;
  size: number;
  format: OutputFormat;
};

const saveFormat: Record<OutputFormat, SaveFormat> = {
  jpg: SaveFormat.JPEG,
  png: SaveFormat.PNG,
};

export async function fileSize(uri: string): Promise<number> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    return blob.size;
  }
  const { File } = await import('expo-file-system');
  try {
    return new File(uri).size ?? 0;
  } catch {
    return 0;
  }
}

export async function pickImages(opts: { multiple?: boolean; limit?: number } = {}): Promise<Picked[]> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: !!opts.multiple,
    selectionLimit: opts.multiple ? opts.limit ?? 20 : 1,
    quality: 1,
    exif: false,
  });
  if (res.canceled) return [];
  const out: Picked[] = [];
  for (const a of res.assets) {
    const size = a.fileSize ?? (await fileSize(a.uri));
    const name = a.fileName ?? `photo-${Date.now()}`;
    const format = extensionOf(name, a.mimeType?.split('/')[1]?.toUpperCase() ?? 'IMG').replace('JPEG', 'JPG');
    out.push({ uri: a.uri, width: a.width, height: a.height, size, name, format });
  }
  return out;
}

async function finish(result: ImageResult, format: OutputFormat): Promise<Processed> {
  return { uri: result.uri, width: result.width, height: result.height, size: await fileSize(result.uri), format };
}

export async function convert(uri: string, format: OutputFormat, quality = 0.92): Promise<Processed> {
  const ref = await ImageManipulator.manipulate(uri).renderAsync();
  const res = await ref.saveAsync({ format: saveFormat[format], compress: format === 'png' ? 1 : quality });
  return finish(res, format);
}

export async function resize(uri: string, o: { width?: number; height?: number; format?: OutputFormat; quality?: number }): Promise<Processed> {
  const format = o.format ?? 'jpg';
  const ctx = ImageManipulator.manipulate(uri);
  if (o.width || o.height) ctx.resize({ width: o.width, height: o.height });
  const ref = await ctx.renderAsync();
  const res = await ref.saveAsync({ format: saveFormat[format], compress: format === 'png' ? 1 : o.quality ?? 0.92 });
  return finish(res, format);
}

export async function compressToQuality(uri: string, quality: number): Promise<Processed> {
  const ref = await ImageManipulator.manipulate(uri).renderAsync();
  const res = await ref.saveAsync({ format: SaveFormat.JPEG, compress: quality });
  return finish(res, 'jpg');
}

// Web can pad on a canvas directly. Native goes through the offscreen FitCanvas (see ui/FitCanvas).
export async function padOnWeb(
  uri: string,
  target: { width: number; height: number },
  drawn: { width: number; height: number; originX: number; originY: number },
  background: string,
): Promise<Processed> {
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize({ width: drawn.width, height: drawn.height });
  ctx.extent({ width: target.width, height: target.height, originX: drawn.originX, originY: drawn.originY, backgroundColor: background });
  const ref = await ctx.renderAsync();
  const res = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.95 });
  return finish(res, 'jpg');
}

// Returns the box an image occupies when contained inside a target canvas.
export function containBox(img: { width: number; height: number }, target: { width: number; height: number }) {
  const s = Math.min(target.width / img.width, target.height / img.height);
  const width = Math.round(img.width * s);
  const height = Math.round(img.height * s);
  return { width, height, originX: Math.round((target.width - width) / 2), originY: Math.round((target.height - height) / 2) };
}

export async function toBase64Jpeg(uri: string, maxSide = 2000): Promise<{ base64: string; width: number; height: number }> {
  const ctx = ImageManipulator.manipulate(uri);
  const probe = await ctx.renderAsync();
  const longest = Math.max(probe.width, probe.height);
  if (longest > maxSide) {
    ctx.reset();
    ctx.resize(probe.width >= probe.height ? { width: maxSide } : { height: maxSide });
  }
  const ref = longest > maxSide ? await ctx.renderAsync() : probe;
  const res = await ref.saveAsync({ format: SaveFormat.JPEG, compress: 0.9, base64: true });
  return { base64: res.base64 ?? '', width: res.width, height: res.height };
}
