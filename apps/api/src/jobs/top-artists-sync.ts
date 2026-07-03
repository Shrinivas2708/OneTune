import { logger } from "../lib/logger";
import * as libraryRepository from "../repositories/library-repository";

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;

let timer: ReturnType<typeof setInterval> | null = null;
let running = false;

export async function syncAllTopArtists(): Promise<number> {
  if (running) {
    logger.debug("top artists sync already running, skipping");
    return 0;
  }

  running = true;
  try {
    const updated = await libraryRepository.recomputeAllUsersTopArtists();
    logger.info({ usersUpdated: updated }, "top artists sync completed");
    return updated;
  } catch (error) {
    logger.error({ err: error }, "top artists sync failed");
    return 0;
  } finally {
    running = false;
  }
}

export function startTopArtistsSyncJob(
  intervalMs = DEFAULT_INTERVAL_MS,
): void {
  if (timer) {
    return;
  }

  void syncAllTopArtists();

  timer = setInterval(() => {
    void syncAllTopArtists();
  }, intervalMs);

  logger.info({ intervalMs }, "top artists sync job started");
}

export function stopTopArtistsSyncJob(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
