import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

function downloadOnWeb(uri: string, name: string) {
  const a = document.createElement('a');
  a.href = uri;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function saveToPhotos(uris: string[], name = 'image-tools.jpg'): Promise<void> {
  if (Platform.OS === 'web') {
    uris.forEach((u, i) => downloadOnWeb(u, uris.length > 1 ? name.replace(/(\.[a-z0-9]+)$/i, `-${i + 1}$1`) : name));
    return;
  }
  // Imported lazily: the module has no web implementation and throws at load time there.
  const MediaLibrary = await import('expo-media-library');
  const perm = await MediaLibrary.requestPermissionsAsync(true);
  if (!perm.granted) throw new Error('Photo library access was not granted');
  for (const u of uris) await MediaLibrary.Asset.create(u);
}

export async function shareFile(uri: string, opts: { name?: string; mimeType?: string; uti?: string } = {}): Promise<void> {
  if (Platform.OS === 'web') {
    downloadOnWeb(uri, opts.name ?? 'image-tools');
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device');
  await Sharing.shareAsync(uri, { mimeType: opts.mimeType, UTI: opts.uti, dialogTitle: opts.name });
}
