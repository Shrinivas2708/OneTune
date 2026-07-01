import { Hono } from "hono";
import { ERROR_CODES } from "@vibevault/config";
import { env } from "@vibevault/config/server";
import { HealthResponseSchema } from "@vibevault/types";
import { jsonSuccess } from "../lib/response";
import type { AppEnv } from "../types";

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get("/health", (c) => {
  const payload = HealthResponseSchema.parse({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  });

  return c.json(payload);
});

healthRoutes.get("/health/deps", async (c) => {
  const checks = await Promise.allSettled([
    fetch(`${env.EXTRACTOR_URL}/health`).then((r) => r.ok),
    fetch(`${env.JIOSAAVN_URL}/api/search/songs?query=test`).then((r) => r.ok),
    fetch(`${env.SPOTIFY_URL}/health`).then((r) => r.ok),
  ]);

  const extractor = checks[0].status === "fulfilled" && checks[0].value;
  const jiosaavn = checks[1].status === "fulfilled" && checks[1].value;
  const spotify = checks[2].status === "fulfilled" && checks[2].value;
  const healthy = extractor && jiosaavn && spotify;

  return jsonSuccess(
    c,
    {
      status: healthy ? "ok" : "degraded",
      service: "api",
      dependencies: { extractor, jiosaavn, spotify },
    },
    healthy ? 200 : 503,
    healthy ? undefined : { errorCode: ERROR_CODES.PROVIDER_UNAVAILABLE },
  );
});
