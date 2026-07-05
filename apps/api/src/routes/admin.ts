import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  AdminOverviewSchema,
  AdminUserDetailSchema,
  AdminUserSummarySchema,
} from "@vibevault/types";
import { jsonSuccess } from "../lib/response";
import { requireAdmin } from "../middleware/require-admin";
import { requireAuth } from "../middleware/request-id";
import * as adminService from "../services/admin-service";
import type { AppEnv } from "../types";

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.use("*", requireAuth);
adminRoutes.use("*", requireAdmin);

adminRoutes.get("/overview", async (c) => {
  const overview = await adminService.getOverview();
  return jsonSuccess(c, AdminOverviewSchema.parse(overview));
});

adminRoutes.get("/users", async (c) => {
  const users = await adminService.listUsers();
  return jsonSuccess(c, z.array(AdminUserSummarySchema).parse(users));
});

adminRoutes.get(
  "/users/:userId",
  zValidator("param", z.object({ userId: z.string().min(1) })),
  async (c) => {
    const { userId } = c.req.valid("param");
    const detail = await adminService.getUserDetail(userId);
    return jsonSuccess(c, AdminUserDetailSchema.parse(detail));
  },
);
