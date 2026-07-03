import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { playlistApi } from "@/lib/playlist-api";
import { getErrorMessage } from "@/lib/error-message";
import { showToast } from "@/stores/toast-store";

export function usePlaylists() {
  return useQuery({
    queryKey: ["playlists"],
    queryFn: () => playlistApi.list(),
    staleTime: 30_000,
  });
}

export function usePlaylist(playlistId: string) {
  return useQuery({
    queryKey: ["playlists", playlistId],
    queryFn: () => playlistApi.get(playlistId),
    enabled: playlistId.length > 0,
    staleTime: 60_000,
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (playlistId: string) => playlistApi.delete(playlistId),
    onSuccess: async (_result, playlistId) => {
      await queryClient.invalidateQueries({ queryKey: ["playlists"] });
      queryClient.removeQueries({ queryKey: ["playlists", playlistId] });
      showToast("Playlist deleted");
      router.back();
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "Could not delete playlist."));
    },
  });
}
