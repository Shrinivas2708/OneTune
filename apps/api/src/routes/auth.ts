import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
  UserSchema,
} from "@vibevault/types";
import { jsonSuccess } from "../lib/response";
import { requireAuth } from "../middleware/request-id";
import * as authService from "../services/auth-service";
import type { AppEnv } from "../types";

export const authRoutes = new Hono<AppEnv>();

authRoutes.post(
  "/register",
  zValidator("json", RegisterRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const result = await authService.register(body);
    return jsonSuccess(c, result, 201);
  },
);

authRoutes.post(
  "/login",
  zValidator("json", LoginRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const result = await authService.login(body);
    return jsonSuccess(c, result);
  },
);

authRoutes.post(
  "/refresh",
  zValidator("json", RefreshTokenRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const result = await authService.refresh(body.refreshToken);
    return jsonSuccess(c, result);
  },
);

authRoutes.post(
  "/logout",
  zValidator("json", RefreshTokenRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    await authService.logout(body.refreshToken);
    return jsonSuccess(c, { success: true });
  },
);

authRoutes.get("/me", requireAuth, async (c) => {
  const userId = c.get("userId")!;
  const user = await authService.getMe(userId);
  return jsonSuccess(c, UserSchema.parse(user));
});
