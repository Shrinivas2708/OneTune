import { useQuery } from "@tanstack/react-query";
import { musicApi } from "@/lib/music-api";

const MIN_QUERY_LENGTH = 2;

export function useUnifiedSearch(query: string) {
  const trimmed = query.trim();
  const enabled = trimmed.length >= MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: ["search", trimmed],
    queryFn: () => musicApi.search(trimmed),
    enabled,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: (previous) => previous,
  });
}

export const SEARCH_MIN_QUERY_LENGTH = MIN_QUERY_LENGTH;
