import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  ImportPlaylistRequestSchema,
  ProviderIdSchema,
  ResolveDownloadRequestSchema,
  ResolveStreamRequestSchema,
} from "@vibevault/types";
import { jsonSuccess } from "../lib/response";
import { providerRegistry } from "../providers";
import type { AppEnv } from "../types";

const InternalSearchQuerySchema = z.object({
  query: z.string().min(1).max(200),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const internalRoutes = new Hono<AppEnv>();

internalRoutes.get("/providers", (c) => {
  const providers = providerRegistry.list().map((provider) => ({
    id: provider.id,
    displayName: provider.displayName,
    capabilities: provider.capabilities,
  }));
  return jsonSuccess(c, { providers });
});

internalRoutes.get(
  "/providers/:providerId/search",
  zValidator("param", z.object({ providerId: ProviderIdSchema })),
  zValidator("query", InternalSearchQuerySchema),
  async (c) => {
    const { providerId } = c.req.valid("param");
    const query = c.req.valid("query");
    const provider = providerRegistry.getOrThrow(providerId);
    const result = await provider.search({
      ...query,
      types: ["track"],
    });
    return jsonSuccess(c, result);
  },
);

internalRoutes.get(
  "/providers/:providerId/tracks/:externalId",
  zValidator(
    "param",
    z.object({ providerId: ProviderIdSchema, externalId: z.string().min(1) }),
  ),
  async (c) => {
    const { providerId, externalId } = c.req.valid("param");
    const provider = providerRegistry.getOrThrow(providerId);
    const metadata = await provider.getMetadata({
      providerId,
      externalId,
    });
    return jsonSuccess(c, metadata);
  },
);

internalRoutes.post(
  "/providers/:providerId/stream",
  zValidator("param", z.object({ providerId: ProviderIdSchema })),
  zValidator("json", ResolveStreamRequestSchema),
  async (c) => {
    const { providerId } = c.req.valid("param");
    const body = c.req.valid("json");
    const provider = providerRegistry.getOrThrow(providerId);
    const manifest = await provider.resolveStream(body.trackRef, body.options);
    return jsonSuccess(c, manifest);
  },
);

internalRoutes.post(
  "/providers/:providerId/download",
  zValidator("param", z.object({ providerId: ProviderIdSchema })),
  zValidator("json", ResolveDownloadRequestSchema),
  async (c) => {
    const { providerId } = c.req.valid("param");
    const body = c.req.valid("json");
    const provider = providerRegistry.getOrThrow(providerId);

    if (!provider.resolveDownload) {
      return c.json(
        {
          error: {
            code: "OPERATION_NOT_SUPPORTED",
            message: `Provider "${providerId}" does not support downloads`,
          },
        },
        501,
      );
    }

    const manifest = await provider.resolveDownload(
      body.trackRef,
      body.options,
    );
    return jsonSuccess(c, manifest);
  },
);

internalRoutes.post(
  "/providers/:providerId/playlists/import",
  zValidator("param", z.object({ providerId: ProviderIdSchema })),
  zValidator("json", ImportPlaylistRequestSchema),
  async (c) => {
    const { providerId } = c.req.valid("param");
    const body = c.req.valid("json");
    const provider = providerRegistry.getOrThrow(providerId);
    const playlist = await provider.importPlaylist(body.url);
    return jsonSuccess(c, playlist);
  },
);
