import { useMutation } from "@tanstack/react-query";
import type { SearchResult, TrackMetadata } from "@vibevault/types";
import * as Haptics from "expo-haptics";
import { ApiClientError } from "@/lib/api-client";
import { libraryApi } from "@/lib/library-api";
import { resolvePlayableResult } from "@/lib/resolve-playable-track";
import { downloadManager } from "@/services/download-manager";
import { playerEngine } from "@/services/player-engine";
import { showToast } from "@/stores/toast-store";
import {
  searchResultToTrack,
  usePlayerStore,
} from "@/stores/player-store";
import { useDownloadStore } from "@/stores/download-store";

async function playTrackResult(result: SearchResult): Promise<TrackMetadata> {
  const track = searchResultToTrack(result);
  const local =
    downloadManager.getLocalRecordForTrack(track) ??
    useDownloadStore.getState().getDownloadRecord(track);

  if (local) {
    await playerEngine.playDownloadedTrack(local.track);
    return local.track;
  }

  const playable = await resolvePlayableResult(result);
  await playerEngine.playSearchResult(playable);
  return searchResultToTrack(playable);
}

export function usePlayTrack() {
  const setIsResolving = usePlayerStore((state) => state.setIsResolving);
  const setResolveError = usePlayerStore((state) => state.setResolveError);

  return useMutation({
    mutationFn: playTrackResult,
    onMutate: () => {
      setIsResolving(true);
      setResolveError(null);
    },
    onSuccess: (track) => {
      setIsResolving(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void libraryApi.recordHistory(track).catch(() => undefined);
    },
    onError: (error) => {
      setIsResolving(false);
      usePlayerStore.getState().setIsPlaying(false);

      const message =
        error instanceof ApiClientError
          ? error.message
          : "Could not start playback. Try another track.";

      setResolveError(message);
      showToast(message);
    },
  });
}
