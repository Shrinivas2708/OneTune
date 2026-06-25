import type { ErrorHandler } from "hono";
import { ERROR_CODES } from "@vibevault/config";
import {
  ProviderError,
  ProviderNotSupportedError,
  ProviderUnavailableError,
} from "@vibevault/provider-core";
import { ZodError } from "zod";
import { AppError, isAppError } from "../lib/errors";
import { createRequestLogger } from "../lib/logger";
import { jsonError } from "../lib/response";
import type { AppEnv } from "../types";

export const errorHandler: ErrorHandler<AppEnv> = (error, c) => {
  const requestId = c.get("requestId") ?? "unknown";
  const log = createRequestLogger(requestId);

  if (error instanceof ZodError) {
    log.warn({ issues: error.issues }, "validation error");
    return jsonError(
      c,
      ERROR_CODES.VALIDATION_ERROR,
      "Request validation failed",
      400,
      error.issues,
    );
  }

  if (error instanceof ProviderNotSupportedError) {
    log.warn({ code: error.code, providerId: error.providerId }, error.message);
    return jsonError(c, ERROR_CODES.PROVIDER_ERROR, error.message, 501);
  }

  if (error instanceof ProviderUnavailableError) {
    log.warn({ code: error.code, providerId: error.providerId }, error.message);
    return jsonError(c, ERROR_CODES.PROVIDER_UNAVAILABLE, error.message, 503);
  }

  if (error instanceof ProviderError) {
    log.warn({ code: error.code, providerId: error.providerId }, error.message);
    return jsonError(c, ERROR_CODES.PROVIDER_ERROR, error.message, 502);
  }

  if (isAppError(error)) {
    if (error.status >= 500) {
      log.error({ err: error, code: error.code }, error.message);
    } else {
      log.warn({ code: error.code }, error.message);
    }

    return jsonError(c, error.code, error.message, error.status, error.details);
  }

  log.error({ err: error }, "unhandled error");

  return jsonError(
    c,
    ERROR_CODES.INTERNAL_ERROR,
    "An unexpected error occurred",
    500,
  );
};
