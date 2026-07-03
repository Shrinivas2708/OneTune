import type { TrackMetadata } from "@vibevault/types";
import { libraryApi } from "@/lib/library-api";
import { queryClient } from "@/lib/query-client";
import { trackKey } from "@/services/player-helpers";

export const HISTORY_QUERY_KEY = ["library", "history"] as const;
export const HISTORY_ARTISTS_QUERY_KEY = ["library", "history", "artists"] as const;

/** Count a listen after this many seconds of playback. */
export const MIN_LISTEN_RECORD_MS = 10_000;

let lastRecordedKey: string | null = null;
let lastRecordedAt = 0;

const RECORD_DEBOUNCE_MS = 2000;

function invalidateHistoryQueries() {
  void queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY });
}

/** Persist a play to the server and refresh history lists in the UI. */
export function recordPlaybackHistory(
  track: TrackMetadata,
  durationPlayedMs?: number,
) {
  const key = trackKey(track);
  const now = Date.now();

  if (key === lastRecordedKey && now - lastRecordedAt < RECORD_DEBOUNCE_MS) {
    return;
  }

  lastRecordedKey = key;
  lastRecordedAt = now;

  void libraryApi
    .recordHistory(track, durationPlayedMs)
    .then(invalidateHistoryQueries)
    .catch(() => undefined);
}

/**
 * Record when the user has actually listened (not just tapped play).
 * Call from player sync on a timer and when the track changes.
 */
export function recordListenIfQualified(
  track: TrackMetadata,
  listenedMs: number,
  alreadyRecorded: boolean,
): boolean {
  if (alreadyRecorded || listenedMs < MIN_LISTEN_RECORD_MS) {
    return alreadyRecorded;
  }

  recordPlaybackHistory(track, listenedMs);
  return true;
}
