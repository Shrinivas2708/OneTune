import { z } from "zod";

export const ServerEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  MONGODB_URI: z
    .string()
    .min(1)
    .default("mongodb://localhost:27017/onetune"),
  JWT_SECRET: z.string().min(16).default("dev-secret-change-me-in-production"),
  EXTRACTOR_URL: z.string().url().default("http://localhost:8001"),
  JIOSAAVN_URL: z.string().url().default("http://localhost:3001"),
  SPOTIFY_URL: z.string().url().default("http://localhost:8003"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

export function parseServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  return ServerEnvSchema.parse(source);
}

export const env = parseServerEnv();
