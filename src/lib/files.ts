import { Platform } from 'react-native';

export async function readBytes(uri: string): Promise<Uint8Array> {
  if (Platform.OS === 'web') return new Uint8Array(await (await fetch(uri)).arrayBuffer());
  const { File } = await import('expo-file-system');
  return new File(uri).bytes();
}

export async function writeBytes(bytes: Uint8Array, name: string, mime: string): Promise<string> {
  if (Platform.OS === 'web') return URL.createObjectURL(new Blob([bytes as BlobPart], { type: mime }));
  const { File, Paths } = await import('expo-file-system');
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(bytes);
  return file.uri;
}
