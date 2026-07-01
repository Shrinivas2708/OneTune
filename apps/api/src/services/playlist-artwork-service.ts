import type { SavedPlaylist, TrackMetadata } from "@vibevault/types";
import { spotifyGetTrack } from "../clients/spotify-client";
import { spotifyToMetadata } from "../providers/mappers";

const ENRICH_CONCURRENCY = 5;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await mapper(items[current]!);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );

  return results;
}

async function enrichSpotifyTrack(track: TrackMetadata): Promise<TrackMetadata> {
  if (track.artworkUrl || track.ref.providerId !== "spotify") {
    return track;
  }

  try {
    const full = await spotifyGetTrack(track.ref.externalId);
    const metadata = spotifyToMetadata(full);

    if (!metadata.artworkUrl) {
      return track;
    }

    return {
      ...track,
      artworkUrl: metadata.artworkUrl,
      album: metadata.album ?? track.album,
    };
  } catch {
    return track;
  }
}

export async function enrichSpotifyPlaylistArtwork(
  playlist: SavedPlaylist,
): Promise<{ playlist: SavedPlaylist; changed: boolean }> {
  if (playlist.sourceProviderId !== "spotify") {
    return { playlist, changed: false };
  }

  const needsTrackArtwork = playlist.tracks.some((track) => !track.artworkUrl);
  const needsPlaylistArtwork = !playlist.artworkUrl;

  if (!needsTrackArtwork && !needsPlaylistArtwork) {
    return { playlist, changed: false };
  }

  const tracks = needsTrackArtwork
    ? await mapWithConcurrency(playlist.tracks, ENRICH_CONCURRENCY, enrichSpotifyTrack)
    : playlist.tracks;

  const artworkUrl =
    playlist.artworkUrl ??
    tracks.find((track) => track.artworkUrl)?.artworkUrl;

  const changed =
    tracks.some(
      (track, trackIndex) => track.artworkUrl !== playlist.tracks[trackIndex]?.artworkUrl,
    ) || Boolean(artworkUrl && artworkUrl !== playlist.artworkUrl);

  if (!changed) {
    return { playlist, changed: false };
  }

  return {
    playlist: {
      ...playlist,
      tracks,
      artworkUrl,
      trackCount: tracks.length,
    },
    changed: true,
  };
}
