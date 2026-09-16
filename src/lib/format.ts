export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 2 : 1)} MB`;
}

export function formatDims(w: number, h: number): string {
  return w > 0 && h > 0 ? `${w} × ${h}` : '—';
}

export function savings(before: number, after: number): string {
  if (!before || !after || after >= before) return '0%';
  return `−${Math.round((1 - after / before) * 100)}%`;
}

export function extensionOf(name: string | null | undefined, fallback: string): string {
  const m = name?.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toUpperCase() : fallback;
}
