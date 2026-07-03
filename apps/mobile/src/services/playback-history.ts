import type { TrackMetadata } from "@vibevault/types";
import { libraryApi } from "@/lib/library-api";
import { queryClient } from "@/lib/query-client";
import { trackKey } from "@/services/player-helpers";

export const HISTORY_QUERY_KEY = ["library", "history"] as const;
export const HISTORY_ARTISTS_QUERY_KEY = ["library", "history", "artists"] as const;

let lastRecordedKey: string | null = null;
let lastRecordedAt = 0;

const RECORD_DEBOUNCE_MS = 2000;

/** Persist a play to the server and refresh history lists in the UI. */
export function recordPlaybackHistory(track: TrackMetadata) {
  const key = trackKey(track);
  const now = Date.now();

  if (key === lastRecordedKey && now - lastRecordedAt < RECORD_DEBOUNCE_MS) {
    return;
  }

  lastRecordedKey = key;
  lastRecordedAt = now;

  void libraryApi
    .recordHistory(track)
    .then(() =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: HISTORY_ARTISTS_QUERY_KEY }),
      ]),
    )
    .catch(() => undefined);
}
