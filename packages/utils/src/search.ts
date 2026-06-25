import type { ProviderId, SearchResult } from "@vibevault/types";
import { normalizeTrackKey } from "./strings";

const PROVIDER_PRIORITY: Record<ProviderId, number> = {
  jiosaavn: 3,
  youtube: 2,
  spotify: 1,
};

function primaryArtist(result: SearchResult): string {
  return result.artists[0]?.name ?? "Unknown Artist";
}

export function deduplicateSearchResults(results: SearchResult[]): SearchResult[] {
  const seen = new Map<string, SearchResult>();

  for (const result of results) {
    const key = normalizeTrackKey(result.title, primaryArtist(result));
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, result);
      continue;
    }

    const existingPriority = PROVIDER_PRIORITY[existing.providerId];
    const candidatePriority = PROVIDER_PRIORITY[result.providerId];

    if (candidatePriority > existingPriority) {
      seen.set(key, result);
      continue;
    }

    if (
      candidatePriority === existingPriority &&
      (result.relevanceScore ?? 0) > (existing.relevanceScore ?? 0)
    ) {
      seen.set(key, result);
    }
  }

  return [...seen.values()];
}

export function rankSearchResults(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => {
    const scoreDelta = (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
    if (scoreDelta !== 0) return scoreDelta;

    const priorityDelta =
      PROVIDER_PRIORITY[b.providerId] - PROVIDER_PRIORITY[a.providerId];
    if (priorityDelta !== 0) return priorityDelta;

    return a.title.localeCompare(b.title);
  });
}

export function assignRelevanceScores(
  results: SearchResult[],
): SearchResult[] {
  if (results.length <= 1) {
    return results.map((result, index) => ({
      ...result,
      relevanceScore: result.relevanceScore ?? 1 - index * 0.05,
    }));
  }

  return results.map((result, index) => ({
    ...result,
    relevanceScore:
      result.relevanceScore ?? Math.max(0.1, 1 - index / results.length),
  }));
}
