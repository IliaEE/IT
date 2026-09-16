import * as Print from 'expo-print';
import { toBase64Jpeg } from './image';
import { fileSize } from './image';

const A4 = { width: 595, height: 842 };

export type PdfResult = { uri: string; pages: number; size: number };

// One photo per A4 page, contained with a small margin. Images are inlined as
// base64 because iOS WebView printing cannot read local file URLs.
export async function imagesToPdf(uris: string[], onProgress?: (p: number) => void): Promise<PdfResult> {
  const pages: string[] = [];
  for (let i = 0; i < uris.length; i++) {
    const { base64 } = await toBase64Jpeg(uris[i]);
    pages.push(`<div class="page"><img src="data:image/jpeg;base64,${base64}" /></div>`);
    onProgress?.((i + 1) / (uris.length + 1));
  }
  const html = `<!doctype html><html><head><meta charset="utf-8" /><style>
    @page { margin: 0; }
    html, body { margin: 0; padding: 0; background: #fff; }
    .page { width: ${A4.width}px; height: ${A4.height}px; box-sizing: border-box; padding: 24px;
            display: flex; align-items: center; justify-content: center; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    img { max-width: 100%; max-height: 100%; object-fit: contain; }
  </style></head><body>${pages.join('')}</body></html>`;
  const res = await Print.printToFileAsync({ html, width: A4.width, height: A4.height, base64: false });
  onProgress?.(1);
  return { uri: res.uri, pages: res.numberOfPages, size: await fileSize(res.uri) };
}
