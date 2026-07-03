import type { TrackMetadata } from "@vibevault/types";

function parseArtistFromTitle(title: string) {
  for (const sep of [" - ", " – ", " — ", " | ", ": "]) {
    const index = title.indexOf(sep);
    if (index > 0) {
      const artist = title.slice(0, index).trim();
      if (artist.length > 0 && artist.length <= 80) {
        return artist;
      }
    }
  }

  return null;
}

function isUnknownArtist(name: string) {
  return !name.trim() || /^unknown artist$/i.test(name.trim());
}

export function formatArtists(track: TrackMetadata) {
  const names = track.artists
    .map((artist) => artist.name.trim())
    .filter((name) => !isUnknownArtist(name));

  if (names.length > 0) {
    return names.join(", ");
  }

  return parseArtistFromTitle(track.title) ?? "Unknown Artist";
}
