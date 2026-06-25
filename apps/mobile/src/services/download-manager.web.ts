import type { TrackMetadata } from "@vibevault/types";
import { downloadIndex } from "@/lib/download-index";
import type { DownloadRecord } from "@/types/download-record";

export const downloadManager = {
  async hydrate() {
    return downloadIndex.loadAll();
  },

  getLocalRecord(trackId: string): DownloadRecord | null {
    return downloadIndex.getById(trackId);
  },

  isDownloaded(trackId: string) {
    return downloadIndex.getById(trackId) !== null;
  },

  async startDownload(
    _track: TrackMetadata,
    _onProgress?: (progress: number) => void,
  ): Promise<DownloadRecord> {
    throw new Error("Downloads are not supported on web.");
  },

  async deleteDownload(_trackId: string): Promise<void> {
    throw new Error("Downloads are not supported on web.");
  },
};
