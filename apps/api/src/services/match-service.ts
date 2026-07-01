import { ERROR_CODES, SEARCH_PROVIDER_TIMEOUT_MS } from "@vibevault/config";
import { providerRegistry } from "@vibevault/provider-core";
import type { SearchResult } from "@vibevault/types";
import {
  assignRelevanceScores,
  boostQueryMatch,
  pickBestPlayableMatch,
} from "@vibevault/utils";
import { AppError } from "../lib/errors";

export interface MatchTrackInput {
  title: string;
  artists: { name: string }[];
  durationMs?: number | null;
}

async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs = 8_000,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Match timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function searchProvider(
  providerId: "jiosaavn" | "youtube",
  query: string,
  limit: number,
): Promise<SearchResult[]> {
  const provider = providerRegistry.get(providerId);
  if (!provider) return [];

  const page = await withTimeout(
    provider.search({
      query,
      page: 1,
      limit,
      types: ["track"],
    }),
    Math.min(SEARCH_PROVIDER_TIMEOUT_MS, 8_000),
  );

  return assignRelevanceScores(boostQueryMatch(page.results, query));
}

export async function matchPlayableTrack(
  input: MatchTrackInput,
): Promise<SearchResult> {
  const artistName = input.artists[0]?.name ?? "";
  const query = `${input.title} ${artistName}`.trim();

  let candidates: SearchResult[] = [];

  try {
    candidates = await searchProvider("jiosaavn", query, 8);
  } catch {
    // JioSaavn is best-effort; YouTube is the fallback.
  }

  let match = pickBestPlayableMatch(candidates, input);

  if (!match) {
    try {
      const youtubeResults = await searchProvider("youtube", query, 5);
      match = pickBestPlayableMatch(
        [...candidates, ...youtubeResults],
        input,
      );
    } catch {
      // Fall through to not-found.
    }
  }

  if (!match) {
    throw new AppError(
      ERROR_CODES.NOT_FOUND,
      "No playable match found for this track",
      404,
    );
  }

  return match;
}
