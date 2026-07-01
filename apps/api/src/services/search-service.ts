import { SEARCH_PROVIDER_TIMEOUT_MS } from "@vibevault/config";
import type { ProviderId, SearchResult } from "@vibevault/types";
import {
  ProviderUnavailableError,
  providerRegistry,
} from "@vibevault/provider-core";
import type { SearchQuery, SearchResultPage } from "@vibevault/types";
import {
  assignRelevanceScores,
  boostQueryMatch,
  boostYouTubeMusicSignals,
  buildPaginationMeta,
  deduplicateSearchResults,
  filterYouTubeSearchResults,
  rankSearchResults,
} from "@vibevault/utils";
import { createRequestLogger } from "../lib/logger";

const SEARCH_CACHE_TTL_MS = 2 * 60_000;
const JIOSAAVN_TIMEOUT_MS = 5_000;
const SPOTIFY_TIMEOUT_MS = 4_000;
const YOUTUBE_TIMEOUT_MS = 6_000;

const searchCache = new Map<
  string,
  { expiresAt: number; page: SearchResultPage }
>();

function searchCacheKey(query: SearchQuery): string {
  return `${query.query.trim().toLowerCase()}:${query.page}:${query.limit}`;
}

function readSearchCache(query: SearchQuery): SearchResultPage | null {
  const entry = searchCache.get(searchCacheKey(query));
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    searchCache.delete(searchCacheKey(query));
    return null;
  }
  return entry.page;
}

function writeSearchCache(query: SearchQuery, page: SearchResultPage) {
  searchCache.set(searchCacheKey(query), {
    expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
    page,
  });
}

async function withProviderTimeout<T>(
  providerId: ProviderId,
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(
            new ProviderUnavailableError(
              providerId,
              new Error(`Provider timed out after ${timeoutMs}ms`),
            ),
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function providerTimeoutMs(providerId: ProviderId): number {
  if (providerId === "jiosaavn") return JIOSAAVN_TIMEOUT_MS;
  if (providerId === "spotify") return SPOTIFY_TIMEOUT_MS;
  if (providerId === "youtube") return YOUTUBE_TIMEOUT_MS;
  return Math.min(SEARCH_PROVIDER_TIMEOUT_MS, 5_000);
}

async function searchProvider(
  providerId: ProviderId,
  query: SearchQuery,
  limit: number,
): Promise<SearchResult[]> {
  const provider = providerRegistry.get(providerId);
  if (!provider) return [];

  const page = await withProviderTimeout(
    providerId,
    provider.search({
      ...query,
      limit,
      types: ["track"],
    }),
    providerTimeoutMs(providerId),
  );

  let results = assignRelevanceScores(page.results);

  if (providerId === "youtube") {
    results = boostYouTubeMusicSignals(
      assignRelevanceScores(filterYouTubeSearchResults(results)),
    );
  }

  return results;
}

export async function unifiedSearch(
  query: SearchQuery,
  requestId?: string,
): Promise<SearchResultPage> {
  const cached = readSearchCache(query);
  if (cached) {
    return cached;
  }

  const log = createRequestLogger(requestId ?? "search");
  const providers = providerRegistry.listSearchable();
  const perProviderLimit = Math.max(
    5,
    Math.ceil(query.limit / Math.max(providers.length, 1)),
  );

  const settled = await Promise.allSettled(
    providers.map(async (provider) => {
      const results = await searchProvider(
        provider.id,
        query,
        perProviderLimit,
      );
      return { providerId: provider.id, results };
    }),
  );

  const providersQueried: ProviderId[] = [];
  const providersFailed: ProviderId[] = [];
  const mergedResults: SearchResult[] = [];

  for (let index = 0; index < settled.length; index += 1) {
    const provider = providers[index]!;
    const result = settled[index]!;
    providersQueried.push(provider.id);

    if (result.status === "fulfilled") {
      mergedResults.push(...result.value.results);
      continue;
    }

    providersFailed.push(provider.id);
    log.warn(
      { providerId: provider.id, err: result.reason },
      "provider search failed",
    );
  }

  const scored = boostQueryMatch(mergedResults, query.query);
  const deduped = deduplicateSearchResults(scored);
  const ranked = rankSearchResults(deduped);

  const start = (query.page - 1) * query.limit;
  const end = start + query.limit;
  const pageResults = ranked.slice(start, end);

  if (providersQueried.length > 0 && providersFailed.length === providersQueried.length) {
    throw new ProviderUnavailableError(
      providersFailed[0]!,
      new Error("All providers failed for unified search"),
    );
  }

  const page: SearchResultPage = {
    results: pageResults,
    meta: buildPaginationMeta(
      query.page,
      query.limit,
      pageResults.length,
      ranked.length,
    ),
    providersQueried,
    providersFailed,
  };

  writeSearchCache(query, page);
  return page;
}
