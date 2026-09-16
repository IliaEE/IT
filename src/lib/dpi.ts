import { Platform } from 'react-native';

// DPI is metadata, not pixels: expo-image-manipulator cannot write it, so we patch the
// container directly — the JFIF APP0 density fields for JPEG, the pHYs chunk for PNG.
// Pure bytes, so it behaves identically on iOS, Android and web.

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

type Segment = { marker: number; start: number; len: number };

// Walk the JPEG marker segments up to start-of-scan.
function jpegSegments(src: Uint8Array): Segment[] {
  const out: Segment[] = [];
  let p = 2;
  while (p + 4 <= src.length && src[p] === 0xff) {
    const marker = src[p + 1];
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      p += 2; // standalone markers carry no length
      continue;
    }
    const len = (src[p + 2] << 8) | src[p + 3];
    out.push({ marker, start: p, len });
    if (marker === 0xda) break;
    p += 2 + len;
  }
  return out;
}

function ascii(src: Uint8Array, at: number, text: string): boolean {
  for (let i = 0; i < text.length; i++) if (src[at + i] !== text.charCodeAt(i)) return false;
  return true;
}

// EXIF IFD0: XResolution / YResolution (RATIONAL) and ResolutionUnit (SHORT = inch).
function patchExif(bytes: Uint8Array, seg: Segment, dpi: number) {
  const tiff = seg.start + 10;
  if (!ascii(bytes, seg.start + 4, 'Exif\0\0')) return;
  const le = bytes[tiff] === 0x49 && bytes[tiff + 1] === 0x49;
  const dv = new DataView(bytes.buffer, bytes.byteOffset);
  const ifd = tiff + dv.getUint32(tiff + 4, le);
  const count = dv.getUint16(ifd, le);
  for (let i = 0; i < count; i++) {
    const e = ifd + 2 + i * 12;
    if (e + 12 > seg.start + 2 + seg.len) break;
    const tag = dv.getUint16(e, le);
    const type = dv.getUint16(e + 2, le);
    if ((tag === 0x011a || tag === 0x011b) && type === 5) {
      const at = tiff + dv.getUint32(e + 8, le);
      dv.setUint32(at, dpi, le);
      dv.setUint32(at + 4, 1, le);
    } else if (tag === 0x0128 && type === 3) {
      dv.setUint16(e + 8, 2, le);
    }
  }
}

// Photoshop APP13: image resource 0x03ED holds a fixed-point 16.16 resolution pair.
function patchPhotoshop(bytes: Uint8Array, seg: Segment, dpi: number) {
  if (!ascii(bytes, seg.start + 4, 'Photoshop 3.0\0')) return;
  const dv = new DataView(bytes.buffer, bytes.byteOffset);
  let p = seg.start + 4 + 14;
  const end = seg.start + 2 + seg.len;
  while (p + 12 <= end && ascii(bytes, p, '8BIM')) {
    const id = dv.getUint16(p + 4);
    const nameLen = bytes[p + 6];
    const nameSize = (nameLen + 1 + 1) & ~1; // pascal string padded to even length
    const sizeAt = p + 6 + nameSize;
    const size = dv.getUint32(sizeAt);
    const data = sizeAt + 4;
    if (id === 0x03ed && size >= 16) {
      dv.setUint32(data, dpi << 16); // hRes, fixed 16.16
      dv.setUint16(data + 4, 1); // hResUnit: pixels per inch
      dv.setUint32(data + 8, dpi << 16); // vRes
      dv.setUint16(data + 12, 1); // vResUnit
      return;
    }
    p = data + ((size + 1) & ~1);
  }
}

export function setJpegDpi(src: Uint8Array, dpi: number): Uint8Array {
  if (src[0] !== 0xff || src[1] !== 0xd8) throw new Error('Not a JPEG file');
  const hi = (dpi >> 8) & 0xff;
  const lo = dpi & 0xff;
  let out = new Uint8Array(src);
  const jfif = jpegSegments(out).find((s) => s.marker === 0xe0 && s.len >= 16 && ascii(out, s.start + 4, 'JFIF\0'));
  if (jfif) {
    out[jfif.start + 11] = 1; // units: dots per inch
    out[jfif.start + 12] = hi;
    out[jfif.start + 13] = lo;
    out[jfif.start + 14] = hi;
    out[jfif.start + 15] = lo;
  } else {
    // No APP0/JFIF: insert one straight after SOI, where the spec wants it.
    const app0 = new Uint8Array([0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, hi, lo, hi, lo, 0x00, 0x00]);
    const grown = new Uint8Array(out.length + app0.length);
    grown.set(out.subarray(0, 2), 0);
    grown.set(app0, 2);
    grown.set(out.subarray(2), 2 + app0.length);
    out = grown;
  }
  // Readers such as ImageIO prefer EXIF and Photoshop resolution over JFIF, so keep all three in sync.
  for (const seg of jpegSegments(out)) {
    if (seg.marker === 0xe1) patchExif(out, seg, dpi);
    if (seg.marker === 0xed) patchPhotoshop(out, seg, dpi);
  }
  return out;
}

export function setPngDpi(src: Uint8Array, dpi: number): Uint8Array {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) if (src[i] !== sig[i]) throw new Error('Not a PNG file');
  const ppm = Math.round(dpi / 0.0254); // pixels per metre
  const body = new Uint8Array(4 + 9);
  body.set([0x70, 0x48, 0x59, 0x73]); // 'pHYs'
  const bv = new DataView(body.buffer);
  bv.setUint32(4, ppm);
  bv.setUint32(8, ppm);
  body[12] = 1; // unit: metre
  const chunk = new Uint8Array(4 + body.length + 4);
  const cv = new DataView(chunk.buffer);
  cv.setUint32(0, 9);
  chunk.set(body, 4);
  cv.setUint32(4 + body.length, crc32(body));

  let p = 8;
  while (p + 8 <= src.length) {
    const len = new DataView(src.buffer, src.byteOffset + p, 4).getUint32(0);
    const type = String.fromCharCode(src[p + 4], src[p + 5], src[p + 6], src[p + 7]);
    const end = p + 12 + len;
    if (type === 'pHYs' || type === 'IDAT' || type === 'IEND') {
      const cut = type === 'pHYs' ? end : p; // replace an existing pHYs, otherwise insert before pixel data
      const out = new Uint8Array(src.length - (cut - p) + chunk.length);
      out.set(src.subarray(0, p), 0);
      out.set(chunk, p);
      out.set(src.subarray(cut), p + chunk.length);
      return out;
    }
    p = end;
  }
  throw new Error('Malformed PNG file');
}

async function readBytes(uri: string): Promise<Uint8Array> {
  if (Platform.OS === 'web') return new Uint8Array(await (await fetch(uri)).arrayBuffer());
  const { File } = await import('expo-file-system');
  return new File(uri).bytes();
}

async function writeBytes(bytes: Uint8Array, name: string, mime: string): Promise<string> {
  if (Platform.OS === 'web') return URL.createObjectURL(new Blob([bytes as BlobPart], { type: mime }));
  const { File, Paths } = await import('expo-file-system');
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(bytes);
  return file.uri;
}

export async function applyDpi(uri: string, dpi: number, format: 'jpg' | 'png'): Promise<string> {
  const bytes = await readBytes(uri);
  const out = format === 'png' ? setPngDpi(bytes, dpi) : setJpegDpi(bytes, dpi);
  return writeBytes(out, `image-tools-${Date.now()}-${dpi}dpi.${format}`, format === 'png' ? 'image/png' : 'image/jpeg');
}
