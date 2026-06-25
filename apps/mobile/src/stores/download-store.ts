import type { TrackMetadata } from "@vibevault/types";
import { create } from "zustand";
import { downloadManager } from "@/services/download-manager";
import { trackKey } from "@/services/player-helpers";
import type { DownloadJobState, DownloadRecord } from "@/types/download-record";

interface DownloadState {
  records: DownloadRecord[];
  jobs: Record<string, DownloadJobState>;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  startDownload: (track: TrackMetadata) => Promise<void>;
  deleteDownload: (trackId: string) => Promise<void>;
  isDownloaded: (track: TrackMetadata) => boolean;
  getJob: (track: TrackMetadata) => DownloadJobState | undefined;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  records: [],
  jobs: {},
  isHydrated: false,

  hydrate: async () => {
    const records = await downloadManager.hydrate();
    set({ records, isHydrated: true });
  },

  startDownload: async (track) => {
    const id = trackKey(track);

    set((state) => ({
      jobs: {
        ...state.jobs,
        [id]: { trackId: id, status: "downloading", progress: 0 },
      },
    }));

    try {
      const record = await downloadManager.startDownload(track, (progress) => {
        set((state) => ({
          jobs: {
            ...state.jobs,
            [id]: {
              trackId: id,
              status: "downloading",
              progress,
            },
          },
        }));
      });

      set((state) => ({
        records: [record, ...state.records.filter((item) => item.id !== id)],
        jobs: {
          ...state.jobs,
          [id]: { trackId: id, status: "completed", progress: 1 },
        },
      }));
    } catch (error) {
      set((state) => ({
        jobs: {
          ...state.jobs,
          [id]: {
            trackId: id,
            status: "failed",
            progress: 0,
            error:
              error instanceof Error
                ? error.message
                : "Download failed",
          },
        },
      }));
      throw error;
    }
  },

  deleteDownload: async (trackId) => {
    await downloadManager.deleteDownload(trackId);
    set((state) => ({
      records: state.records.filter((record) => record.id !== trackId),
      jobs: Object.fromEntries(
        Object.entries(state.jobs).filter(([key]) => key !== trackId),
      ),
    }));
  },

  isDownloaded: (track) => {
    const id = trackKey(track);
    return get().records.some((record) => record.id === id);
  },

  getJob: (track) => {
    const id = trackKey(track);
    return get().jobs[id];
  },
}));
