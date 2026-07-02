import type { TrackMetadata } from "@vibevault/types";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { getErrorMessage } from "@/lib/error-message";
import { playerEngine } from "@/services/player-engine";
import { showToast } from "@/stores/toast-store";
import { usePlayerStore } from "@/stores/player-store";

export function usePlayDownloadedTrack() {
  const setIsResolving = usePlayerStore((state) => state.setIsResolving);
  const setResolveError = usePlayerStore((state) => state.setResolveError);

  return useMutation({
    mutationFn: async (track: TrackMetadata) => {
      await playerEngine.playDownloadedTrack(track);
      return track;
    },
    onMutate: () => {
      setIsResolving(true);
      setResolveError(null);
    },
    onSuccess: () => {
      setIsResolving(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      setIsResolving(false);
      usePlayerStore.getState().setIsPlaying(false);

      const message = getErrorMessage(error, "Could not play downloaded track.");
      setResolveError(message);
      showToast(message, "error");
    },
  });
}
