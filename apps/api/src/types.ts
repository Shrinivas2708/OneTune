import type { Context } from "hono";

export type AppEnv = {
  Variables: {
    requestId: string;
    userId?: string;
    userEmail?: string;
  };
};

export function getRequestId(c: Context<AppEnv>): string {
  return c.get("requestId");
}

export function getUserId(c: Context<AppEnv>): string {
  const userId = c.get("userId");
  if (!userId) {
    throw new Error("userId not set — requireAuth middleware missing?");
  }
  return userId;
}
