export type ToolName = 'convert' | 'resize' | 'fit' | 'compress';

// Every file the app hands out is named image-tools-<tool>-<date>[-<n>].<ext>,
// so a user can tell in Files, Photos or a chat what produced it and when.
export function outputName(tool: ToolName, ext: string, index = 0, total = 1): string {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const suffix = total > 1 ? `-${String(index + 1).padStart(String(total).length, '0')}` : '';
  return `image-tools-${tool}-${date}${suffix}.${ext}`;
}
