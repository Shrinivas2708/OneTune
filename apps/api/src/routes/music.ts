import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  DownloadManifestSchema,
  ProviderIdSchema,
  ResolveDownloadRequestSchema,
  ResolveStreamRequestSchema,
  SearchRequestQuerySchema,
  SearchResultPageSchema,
  StreamManifestSchema,
  TrackMetadataSchema,
} from "@vibevault/types";
import { jsonSuccess } from "../lib/response";
import { requireAuth } from "../middleware/request-id";
import * as mediaService from "../services/media-service";
import * as searchService from "../services/search-service";
import { getRequestId } from "../types";
import type { AppEnv } from "../types";

export const musicRoutes = new Hono<AppEnv>();

musicRoutes.use("*", requireAuth);

musicRoutes.get(
  "/search",
  zValidator("query", SearchRequestQuerySchema),
  async (c) => {
    const { q, page, limit } = c.req.valid("query");
    const result = await searchService.unifiedSearch(
      {
        query: q,
        page,
        limit,
        types: ["track"],
      },
      getRequestId(c),
    );

    return jsonSuccess(c, SearchResultPageSchema.parse(result));
  },
);

musicRoutes.get(
  "/tracks/:providerId/:externalId",
  zValidator(
    "param",
    z.object({
      providerId: ProviderIdSchema,
      externalId: z.string().min(1),
    }),
  ),
  async (c) => {
    const { providerId, externalId } = c.req.valid("param");
    const metadata = await mediaService.getTrackMetadata(providerId, externalId);
    return jsonSuccess(c, TrackMetadataSchema.parse(metadata));
  },
);

musicRoutes.post(
  "/stream/resolve",
  zValidator("json", ResolveStreamRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const manifest = await mediaService.resolveStream(
      body.trackRef,
      body.options,
    );
    return jsonSuccess(c, StreamManifestSchema.parse(manifest));
  },
);

musicRoutes.post(
  "/downloads/resolve",
  zValidator("json", ResolveDownloadRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const manifest = await mediaService.resolveDownload(
      body.trackRef,
      body.options,
    );
    return jsonSuccess(c, DownloadManifestSchema.parse(manifest));
  },
);
