import { createMiddleware } from "hono/factory";
import { ERROR_CODES } from "@vibevault/config";
import { AppError } from "../lib/errors";
import { createRequestLogger } from "../lib/logger";
import type { AppEnv } from "../types";

export const requestIdMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const requestId =
    c.req.header("x-request-id") ?? crypto.randomUUID();

  c.set("requestId", requestId);
  c.header("X-Request-Id", requestId);

  const log = createRequestLogger(requestId);
  const start = performance.now();

  log.info(
    { method: c.req.method, path: c.req.path },
    "request started",
  );

  await next();

  log.info(
    {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Math.round(performance.now() - start),
    },
    "request completed",
  );
});

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header("Authorization");

  if (!header?.startsWith("Bearer ")) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Missing access token", 401);
  }

  const { verifyAccessToken } = await import("../lib/jwt");
  const token = header.slice("Bearer ".length);
  const payload = await verifyAccessToken(token);

  c.set("userId", payload.sub);
  c.set("userEmail", payload.email);

  await next();
});
