export function normalizeTrackKey(title: string, artist: string): string {
  return `${artist}:${title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
