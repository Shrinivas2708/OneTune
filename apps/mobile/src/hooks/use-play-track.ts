import { useMutation } from "@tanstack/react-query";
import type { SearchResult } from "@vibevault/types";
import * as Haptics from "expo-haptics";
import { ApiClientError } from "@/lib/api-client";
import { libraryApi } from "@/lib/library-api";
import { resolvePlayableResult } from "@/lib/resolve-playable-track";
import { playerEngine } from "@/services/player-engine";
import { showToast } from "@/stores/toast-store";
import {
  searchResultToTrack,
  usePlayerStore,
} from "@/stores/player-store";

export function usePlayTrack() {
  const setIsResolving = usePlayerStore((state) => state.setIsResolving);
  const setResolveError = usePlayerStore((state) => state.setResolveError);

  return useMutation({
    mutationFn: async (result: SearchResult) => {
      const playable = await resolvePlayableResult(result);
      await playerEngine.playSearchResult(playable);
      return searchResultToTrack(playable);
    },
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
