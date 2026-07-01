import { ERROR_CODES } from "@vibevault/config";
import type { SearchResult } from "@vibevault/types";
import { pickBestPlayableMatch } from "@vibevault/utils";
import { AppError } from "../lib/errors";
import * as searchService from "./search-service";

export interface MatchTrackInput {
  title: string;
  artists: { name: string }[];
  durationMs?: number | null;
}

export async function matchPlayableTrack(
  input: MatchTrackInput,
  requestId?: string,
): Promise<SearchResult> {
  const artistName = input.artists[0]?.name ?? "";
  const query = `${input.title} ${artistName}`.trim();

  const page = await searchService.unifiedSearch(
    {
      query,
      page: 1,
      limit: 20,
      types: ["track"],
    },
    requestId,
  );

  const match = pickBestPlayableMatch(page.results, input);

  if (!match) {
    throw new AppError(
      ERROR_CODES.NOT_FOUND,
      "No playable match found for this track",
      404,
    );
  }

  return match;
}
