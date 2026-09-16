import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

export type Named = { uri: string; name: string };

function downloadOnWeb(uri: string, name: string) {
  const a = document.createElement('a');
  a.href = uri;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Processing leaves UUID-named temp files. Copy each one into a fresh cache folder under its
// final name: Photos keeps that name as the asset's original filename, the share sheet shows it.
async function materialize(items: Named[]): Promise<string[]> {
  const { Directory, File, Paths } = await import('expo-file-system');
  const dir = new Directory(Paths.cache, 'image-tools', String(Date.now()));
  dir.create({ intermediates: true, idempotent: true });
  const out: string[] = [];
  for (const it of items) {
    const dest = new File(dir, it.name);
    await new File(it.uri).copy(dest, { overwrite: true });
    out.push(dest.uri);
  }
  return out;
}

export async function saveToPhotos(items: Named[]): Promise<void> {
  if (Platform.OS === 'web') {
    items.forEach((it) => downloadOnWeb(it.uri, it.name));
    return;
  }
  // Imported lazily: the module has no web implementation and throws at load time there.
  const MediaLibrary = await import('expo-media-library');
  const perm = await MediaLibrary.requestPermissionsAsync(true);
  if (!perm.granted) throw new Error('Photo library access was not granted');
  for (const uri of await materialize(items)) await MediaLibrary.Asset.create(uri);
}

export async function shareFile(item: Named, opts: { mimeType?: string; uti?: string } = {}): Promise<void> {
  if (Platform.OS === 'web') {
    downloadOnWeb(item.uri, item.name);
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device');
  const [uri] = await materialize([item]);
  await Sharing.shareAsync(uri, { mimeType: opts.mimeType, UTI: opts.uti, dialogTitle: item.name });
}
