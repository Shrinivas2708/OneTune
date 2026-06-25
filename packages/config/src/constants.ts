export const APP_NAME = "VibeVault" as const;

export const API_VERSION = "v1" as const;

export const DEFAULT_SEARCH_LIMIT = 20 as const;

export const MAX_SEARCH_LIMIT = 50 as const;

export const SEARCH_PROVIDER_TIMEOUT_MS = 8_000 as const;

export const STREAM_URL_REFRESH_BUFFER_MS = 30_000 as const;

export const JWT_ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export const JWT_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const PASSWORD_MIN_LENGTH = 8 as const;

export const DISPLAY_NAME_MAX_LENGTH = 64 as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  PROVIDER_UNAVAILABLE: "PROVIDER_UNAVAILABLE",
  STREAM_EXPIRED: "STREAM_EXPIRED",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
