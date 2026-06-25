import pino from "pino";
import { env } from "@vibevault/config/server";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "api" },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}
