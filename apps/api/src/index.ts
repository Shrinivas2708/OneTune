import { createApp } from "./app";
import { connectDb } from "./lib/db";
import { startTopArtistsSyncJob } from "./jobs/top-artists-sync";
import { logger } from "./lib/logger";
import { registerProviders } from "./providers";
import { env } from "@vibevault/config/server";

await connectDb();
registerProviders();
startTopArtistsSyncJob();

const app = createApp();

logger.info({ port: env.PORT }, "api listening");

export default {
  port: env.PORT,
  fetch: app.fetch,
};
