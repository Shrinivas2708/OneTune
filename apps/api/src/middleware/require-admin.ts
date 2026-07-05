import { createMiddleware } from "hono/factory";
import { ERROR_CODES } from "@vibevault/config";
import { AppError } from "../lib/errors";
import { isUserAdmin } from "../repositories/user-repository";
import type { AppEnv } from "../types";

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const userId = c.get("userId");
  if (!userId) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Missing access token", 401);
  }

  const admin = await isUserAdmin(userId);
  if (!admin) {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Admin access required", 403);
  }

  await next();
});
