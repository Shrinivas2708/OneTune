import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  AdminOverviewSchema,
  AdminUserDetailSchema,
  AdminUserSummarySchema,
  AuthResponseSchema,
  LoginRequestSchema,
} from "@vibevault/types";
import { jsonSuccess } from "../lib/response";
import { requireAdmin } from "../middleware/require-admin";
import { requireAuth } from "../middleware/request-id";
import * as adminService from "../services/admin-service";
import * as authService from "../services/auth-service";
import type { AppEnv } from "../types";

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.post(
  "/login",
  zValidator("json", LoginRequestSchema),
  async (c) => {
    const body = c.req.valid("json");
    const result = await authService.loginAdmin(body);
    return jsonSuccess(c, AuthResponseSchema.parse(result));
  },
);

const protectedAdmin = new Hono<AppEnv>();
protectedAdmin.use("*", requireAuth);
protectedAdmin.use("*", requireAdmin);

protectedAdmin.get("/overview", async (c) => {
  const overview = await adminService.getOverview();
  return jsonSuccess(c, AdminOverviewSchema.parse(overview));
});

protectedAdmin.get("/users", async (c) => {
  const users = await adminService.listUsers();
  return jsonSuccess(c, z.array(AdminUserSummarySchema).parse(users));
});

protectedAdmin.get(
  "/users/:userId",
  zValidator("param", z.object({ userId: z.string().min(1) })),
  async (c) => {
    const { userId } = c.req.valid("param");
    const detail = await adminService.getUserDetail(userId);
    return jsonSuccess(c, AdminUserDetailSchema.parse(detail));
  },
);

adminRoutes.route("/", protectedAdmin);
