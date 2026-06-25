import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ApiErrorResponse, ApiSuccessResponse } from "@vibevault/types";
import type { AppEnv } from "../types";

export function jsonSuccess<T>(
  c: Context<AppEnv>,
  data: T,
  status: ContentfulStatusCode = 200,
  meta?: Record<string, unknown>,
) {
  const body: ApiSuccessResponse<T> = meta ? { data, meta } : { data };
  return c.json(body, status);
}

export function jsonError(
  c: Context<AppEnv>,
  code: string,
  message: string,
  status: number,
  details?: unknown,
) {
  const body: ApiErrorResponse = {
    error: { code, message, details },
  };
  return c.json(body, status as 400);
}
