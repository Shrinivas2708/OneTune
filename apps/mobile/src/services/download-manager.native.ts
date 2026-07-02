import type { TrackMetadata } from "@vibevault/types";
import * as FileSystem from "expo-file-system/legacy";
import { downloadIndex } from "@/lib/download-index";
import { musicApi } from "@/lib/music-api";
import { trackKey } from "@/services/player-helpers";
import type { DownloadRecord } from "@/types/download-record";

const DOWNLOADS_DIR = `${FileSystem.documentDirectory ?? ""}downloads/`;

const activeJobs = new Map<string, FileSystem.DownloadResumable>();

function extensionForFormat(format: string) {
  if (format === "best") return "m4a";
  return format.replace(/^\./, "");
}

function buildLocalPaths(track: TrackMetadata, format: string) {
  const id = trackKey(track);
  const ext = extensionForFormat(format);
  const filename = `${id.replace(/:/g, "_")}.${ext}`;
  const localPath = `${DOWNLOADS_DIR}${filename}`;
  return { id, filename, localPath, fileUri: localPath };
}

async function ensureDownloadsDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
  }
}

export const downloadManager = {
  async hydrate() {
    return downloadIndex.loadAll();
  },

  getLocalRecord(trackId: string): DownloadRecord | null {
    return downloadIndex.getById(trackId);
  },

  getLocalRecordForTrack(track: TrackMetadata): DownloadRecord | null {
    const id = trackKey(track);
    const direct = downloadIndex.getById(id);
    if (direct) return direct;

    return (
      downloadIndex
        .loadAll()
        .find(
          (record) =>
            record.sourceTrackId === id ||
            (record.track.title === track.title &&
              record.track.artists[0]?.name === track.artists[0]?.name),
        ) ?? null
    );
  },

  isDownloaded(trackId: string) {
    return downloadIndex.getById(trackId) !== null;
  },

  async startDownload(
    track: TrackMetadata,
    onProgress?: (progress: number) => void,
    sourceTrackId?: string,
  ): Promise<DownloadRecord> {
    const id = trackKey(track);
    const existing = downloadIndex.getById(id);

    if (existing) {
      const info = await FileSystem.getInfoAsync(existing.localPath);
      if (info.exists) {
        return existing;
      }
      downloadIndex.remove(id);
    }

    await ensureDownloadsDir();

    const manifest = await musicApi.resolveDownload({ trackRef: track.ref });
    const paths = buildLocalPaths(track, manifest.format);

    if (activeJobs.has(id)) {
      const current = downloadIndex.getById(id);
      if (current) return current;
    }

    const download = FileSystem.createDownloadResumable(
      manifest.url,
      paths.localPath,
      undefined,
      (progress) => {
        const total = progress.totalBytesExpectedToWrite;
        const written = progress.totalBytesWritten;
        if (total > 0) {
          onProgress?.(written / total);
        }
      },
    );

    activeJobs.set(id, download);

    try {
      const result = await download.downloadAsync();
      if (!result?.uri) {
        throw new Error("Download failed");
      }

      const record: DownloadRecord = {
        id,
        sourceTrackId,
        track,
        localPath: result.uri,
        fileUri: result.uri,
        filename: paths.filename,
        format: manifest.format,
        sizeBytes: manifest.sizeBytes,
        downloadedAt: new Date().toISOString(),
      };

      downloadIndex.upsert(record);
      return record;
    } finally {
      activeJobs.delete(id);
    }
  },

  async deleteDownload(trackId: string): Promise<void> {
    const record = downloadIndex.getById(trackId);
    if (!record) return;

    const job = activeJobs.get(trackId);
    if (job) {
      try {
        await job.pauseAsync();
      } catch {
        // Ignore pause errors while canceling.
      }
      activeJobs.delete(trackId);
    }

    const info = await FileSystem.getInfoAsync(record.localPath);
    if (info.exists) {
      await FileSystem.deleteAsync(record.localPath, { idempotent: true });
    }

    downloadIndex.remove(trackId);
  },
};
