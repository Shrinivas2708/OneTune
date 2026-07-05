import { z } from "zod";
import { HistoryEntrySchema } from "./domain";

export const AdminOverviewSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  usersWithPlays: z.number().int().nonnegative(),
  totalPlays: z.number().int().nonnegative(),
  topArtistsGlobal: z.array(
    z.object({
      name: z.string().min(1),
      playCount: z.number().int().positive(),
    }),
  ),
});

export type AdminOverview = z.infer<typeof AdminOverviewSchema>;

export const AdminUserSummarySchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
  createdAt: z.string().datetime(),
  totalPlays: z.number().int().nonnegative(),
  lastPlayedAt: z.string().datetime().nullable(),
  topArtist: z.string().nullable(),
});

export type AdminUserSummary = z.infer<typeof AdminUserSummarySchema>;

export const AdminUserDetailSchema = z.object({
  user: AdminUserSummarySchema.omit({
    totalPlays: true,
    lastPlayedAt: true,
    topArtist: true,
  }),
  stats: z.object({
    totalPlays: z.number().int().nonnegative(),
    lastPlayedAt: z.string().datetime().nullable(),
  }),
  topArtists: z.array(
    z.object({
      name: z.string().min(1),
      playCount: z.number().int().positive(),
    }),
  ),
  recentHistory: z.array(HistoryEntrySchema),
});

export type AdminUserDetail = z.infer<typeof AdminUserDetailSchema>;
