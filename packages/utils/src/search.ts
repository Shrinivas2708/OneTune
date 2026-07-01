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
    const priorityDelta =
      PROVIDER_PRIORITY[b.providerId] - PROVIDER_PRIORITY[a.providerId];
    if (priorityDelta !== 0) return priorityDelta;

    const scoreDelta = (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0);
    if (scoreDelta !== 0) return scoreDelta;

    return a.title.localeCompare(b.title);
  });
}

/** Boost results whose title/artist match query tokens (0–1 added to base score). */
export function boostQueryMatch(
  results: SearchResult[],
  query: string,
): SearchResult[] {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);

  if (tokens.length === 0) return results;

  return results.map((result) => {
    const haystack = `${result.title} ${primaryArtist(result)}`.toLowerCase();
    const matched = tokens.filter((token) => haystack.includes(token)).length;
    const matchScore = matched / tokens.length;
    const base = result.relevanceScore ?? 0.5;

    return {
      ...result,
      relevanceScore: Math.min(1, base * 0.55 + matchScore * 0.45),
    };
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
