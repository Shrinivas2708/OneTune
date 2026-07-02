import type { TrackMetadata } from "@vibevault/types";
import { create } from "zustand";
import { findDownloadJob, findDownloadRecord } from "@/lib/download-lookup";
import { getErrorMessage } from "@/lib/error-message";
import { resolvePlayableTrack } from "@/lib/resolve-playable-track";
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
  getDownloadRecord: (track: TrackMetadata) => DownloadRecord | null;
  isDownloaded: (track: TrackMetadata) => boolean;
  getJob: (track: TrackMetadata) => DownloadJobState | undefined;
}

function jobKeyForTrack(track: TrackMetadata) {
  return trackKey(track);
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  records: [],
  jobs: {},
  isHydrated: false,

  hydrate: async () => {
    const records = await downloadManager.hydrate();
    set({ records, isHydrated: true });
  },

  startDownload: async (sourceTrack) => {
    const uiKey = jobKeyForTrack(sourceTrack);
    let playable = sourceTrack;

    set((state) => ({
      jobs: {
        ...state.jobs,
        [uiKey]: { trackId: uiKey, status: "downloading", progress: 0 },
      },
    }));

    try {
      playable = await resolvePlayableTrack(sourceTrack);
      const downloadId = trackKey(playable);

      const record = await downloadManager.startDownload(
        playable,
        (progress) => {
          set((state) => ({
            jobs: {
              ...state.jobs,
              [uiKey]: {
                trackId: uiKey,
                status: "downloading",
                progress,
              },
            },
          }));
        },
        trackKey(sourceTrack),
      );

      set((state) => ({
        records: [
          record,
          ...state.records.filter(
            (item) => item.id !== record.id && item.sourceTrackId !== uiKey,
          ),
        ],
        jobs: {
          ...state.jobs,
          [uiKey]: { trackId: uiKey, status: "completed", progress: 1 },
        },
      }));
    } catch (error) {
      set((state) => ({
        jobs: {
          ...state.jobs,
          [uiKey]: {
            trackId: uiKey,
            status: "failed",
            progress: 0,
            error: getErrorMessage(error, "Download failed"),
          },
        },
      }));
      throw error;
    }
  },

  deleteDownload: async (trackId) => {
    const record = get().records.find(
      (item) => item.id === trackId || item.sourceTrackId === trackId,
    );
    const storageId = record?.id ?? trackId;

    await downloadManager.deleteDownload(storageId);
    set((state) => ({
      records: state.records.filter(
        (item) => item.id !== storageId && item.sourceTrackId !== trackId,
      ),
      jobs: Object.fromEntries(
        Object.entries(state.jobs).filter(
          ([key]) => key !== trackId && key !== storageId && key !== record?.sourceTrackId,
        ),
      ),
    }));
  },

  getDownloadRecord: (track) => findDownloadRecord(get().records, track),

  isDownloaded: (track) => findDownloadRecord(get().records, track) !== null,

  getJob: (track) => findDownloadJob(get().jobs, get().records, track),
}));
