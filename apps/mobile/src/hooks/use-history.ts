import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "@/lib/library-api";
import { getErrorMessage } from "@/lib/error-message";
import { showToast } from "@/stores/toast-store";
import { useAuthStore } from "@/stores/auth-store";

import { HISTORY_ARTISTS_QUERY_KEY, HISTORY_QUERY_KEY } from "@/services/playback-history";

const HISTORY_KEY = HISTORY_QUERY_KEY;
const HISTORY_ARTISTS_KEY = HISTORY_ARTISTS_QUERY_KEY;

export function useHistory(limit = 50) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: [...HISTORY_KEY, limit],
    queryFn: () => libraryApi.listHistory(limit),
    staleTime: 30_000,
    enabled: isAuthenticated,
  });
}

export function useHistoryArtists(limit = 8) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: [...HISTORY_ARTISTS_KEY, limit],
    queryFn: () => libraryApi.listHistoryArtists(limit),
    staleTime: 5 * 60_000,
    refetchInterval: 15 * 60_000,
    enabled: isAuthenticated,
  });
}

export function useClearHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => libraryApi.clearHistory(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HISTORY_KEY }),
        queryClient.invalidateQueries({ queryKey: HISTORY_ARTISTS_KEY }),
      ]);
      showToast("History cleared");
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "Could not clear history."));
    },
  });
}
