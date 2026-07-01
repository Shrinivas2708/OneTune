import {
  DownloadManifestSchema,
  MatchTrackRequestSchema,
  ResolveDownloadRequestSchema,
  ResolveStreamRequestSchema,
  SearchResultPageSchema,
  SearchResultSchema,
  StreamManifestSchema,
  type MatchTrackRequest,
  type ResolveDownloadRequest,
  type ResolveStreamRequest,
  type SearchResultPage,
} from "@vibevault/types";
import { apiRequest } from "./api-client";

export const musicApi = {
  search: (query: string, page = 1, limit = 20): Promise<SearchResultPage> => {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      limit: String(limit),
    });

    return apiRequest(`/v1/search?${params.toString()}`, { method: "GET" }, SearchResultPageSchema);
  },

  resolveStream: (request: ResolveStreamRequest) =>
    apiRequest(
      "/v1/stream/resolve",
      {
        method: "POST",
        body: JSON.stringify(ResolveStreamRequestSchema.parse(request)),
      },
      StreamManifestSchema,
    ),

  resolveDownload: (request: ResolveDownloadRequest) =>
    apiRequest(
      "/v1/downloads/resolve",
      {
        method: "POST",
        body: JSON.stringify(ResolveDownloadRequestSchema.parse(request)),
      },
      DownloadManifestSchema,
    ),

  matchTrack: (request: MatchTrackRequest) =>
    apiRequest(
      "/v1/tracks/match",
      {
        method: "POST",
        body: JSON.stringify(MatchTrackRequestSchema.parse(request)),
      },
      SearchResultSchema,
    ),
};
