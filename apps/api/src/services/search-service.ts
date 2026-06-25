import { SEARCH_PROVIDER_TIMEOUT_MS } from "@vibevault/config";
import type { ProviderId } from "@vibevault/types";
import {
  ProviderUnavailableError,
  providerRegistry,
} from "@vibevault/provider-core";
import type { SearchQuery, SearchResultPage } from "@vibevault/types";
import {
  assignRelevanceScores,
  buildPaginationMeta,
  deduplicateSearchResults,
  rankSearchResults,
} from "@vibevault/utils";
import { createRequestLogger } from "../lib/logger";

async function withProviderTimeout<T>(
  providerId: ProviderId,
  operation: Promise<T>,
  timeoutMs = SEARCH_PROVIDER_TIMEOUT_MS,
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

export async function unifiedSearch(
  query: SearchQuery,
  requestId?: string,
): Promise<SearchResultPage> {
  const log = createRequestLogger(requestId ?? "search");
  const providers = providerRegistry.listSearchable();

  const settled = await Promise.allSettled(
    providers.map(async (provider) => {
      const page = await withProviderTimeout(
        provider.id,
        provider.search({
          ...query,
          types: ["track"],
        }),
      );
      return { providerId: provider.id, page };
    }),
  );

  const providersQueried: ProviderId[] = [];
  const providersFailed: ProviderId[] = [];
  const mergedResults = [];

  for (let index = 0; index < settled.length; index += 1) {
    const provider = providers[index]!;
    const result = settled[index]!;

    providersQueried.push(provider.id);

    if (result.status === "fulfilled") {
      mergedResults.push(...result.value.page.results);
      continue;
    }

    providersFailed.push(provider.id);
    log.warn(
      { providerId: provider.id, err: result.reason },
      "provider search failed",
    );
  }

  const scored = assignRelevanceScores(mergedResults);
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

  return {
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
}
