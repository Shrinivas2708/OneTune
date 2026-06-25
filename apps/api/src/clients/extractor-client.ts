import { env } from "@vibevault/config/server";
import { postJson } from "../lib/http-client";

export interface ExtractorTrack {
  id: string;
  provider: string;
  title: string;
  artists: Array<{ id: string | null; name: string }>;
  album?: { id: string | null; name: string | null; artwork_url: string | null } | null;
  artwork_url: string | null;
  duration_ms: number | null;
  is_video: boolean;
  url: string;
}

export interface ExtractorStream {
  url: string;
  expires_at: string;
  mime_type: string | null;
  bitrate: number | null;
  is_video: boolean;
  headers: Record<string, string> | null;
}

export interface ExtractorDownload {
  url: string;
  filename: string;
  format: string;
  size_bytes: number | null;
  expires_at: string | null;
}

export interface ExtractorPlaylist {
  id: string | null;
  name: string;
  description: string | null;
  artwork_url: string | null;
  track_count: number | null;
  owner: string | null;
  source_url: string;
  tracks: ExtractorTrack[];
}

export async function extractorSearch(
  query: string,
  limit: number,
): Promise<ExtractorTrack[]> {
  const result = await postJson<{ tracks: ExtractorTrack[] }>(
    `${env.EXTRACTOR_URL}/extract/search`,
    { query, limit },
  );
  return result.tracks;
}

export async function extractorMetadata(url: string): Promise<ExtractorTrack> {
  return postJson<ExtractorTrack>(`${env.EXTRACTOR_URL}/extract/metadata`, {
    url,
  });
}

export async function extractorStream(
  url: string,
  preferVideo = false,
): Promise<ExtractorStream> {
  const endpoint = `${env.EXTRACTOR_URL}/extract/stream?prefer_video=${preferVideo}`;
  return postJson<ExtractorStream>(endpoint, { url });
}

export async function extractorDownload(url: string): Promise<ExtractorDownload> {
  return postJson<ExtractorDownload>(`${env.EXTRACTOR_URL}/extract/download`, {
    url,
  });
}

export async function extractorPlaylist(
  url: string,
  maxTracks = 100,
): Promise<ExtractorPlaylist> {
  return postJson<ExtractorPlaylist>(
    `${env.EXTRACTOR_URL}/extract/playlist?max_tracks=${maxTracks}`,
    { url },
  );
}

export function youtubeUrl(externalId: string, url?: string): string {
  if (url) return url;
  if (externalId.startsWith("http")) return externalId;
  return `https://www.youtube.com/watch?v=${externalId}`;
}
