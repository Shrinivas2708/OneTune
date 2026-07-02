import type { TrackMetadata } from "@vibevault/types";
import { trackKey } from "@/services/player-helpers";
import type { DownloadJobState, DownloadRecord } from "@/types/download-record";

function sameTrackIdentity(a: TrackMetadata, b: TrackMetadata) {
  const artistA = a.artists[0]?.name?.toLowerCase() ?? "";
  const artistB = b.artists[0]?.name?.toLowerCase() ?? "";
  return a.title.toLowerCase() === b.title.toLowerCase() && artistA === artistB;
}

export function matchesDownloadTrack(
  record: DownloadRecord,
  track: TrackMetadata,
): boolean {
  const id = trackKey(track);
  return (
    record.id === id ||
    record.sourceTrackId === id ||
    sameTrackIdentity(record.track, track)
  );
}

export function findDownloadRecord(
  records: DownloadRecord[],
  track: TrackMetadata,
): DownloadRecord | null {
  return records.find((record) => matchesDownloadTrack(record, track)) ?? null;
}

export function findDownloadJob(
  jobs: Record<string, DownloadJobState>,
  records: DownloadRecord[],
  track: TrackMetadata,
): DownloadJobState | undefined {
  const id = trackKey(track);
  if (jobs[id]) return jobs[id];

  const record = findDownloadRecord(records, track);
  if (!record) return undefined;

  return jobs[record.id] ?? jobs[record.sourceTrackId ?? ""] ?? undefined;
}
