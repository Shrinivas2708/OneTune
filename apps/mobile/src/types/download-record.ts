import { TrackMetadataSchema, type TrackMetadata } from "@vibevault/types";
import { z } from "zod";

export const DownloadRecordSchema = z.object({
  id: z.string().min(1),
  sourceTrackId: z.string().min(1).optional(),
  track: TrackMetadataSchema,
  localPath: z.string().min(1),
  fileUri: z.string().min(1),
  filename: z.string().min(1),
  format: z.string().min(1),
  sizeBytes: z.number().int().positive().optional(),
  downloadedAt: z.string().datetime(),
});

export type DownloadRecord = z.infer<typeof DownloadRecordSchema>;

export type DownloadJobStatus = "idle" | "downloading" | "completed" | "failed";

export interface DownloadJobState {
  trackId: string;
  status: DownloadJobStatus;
  progress: number;
  error?: string;
}

export const DOWNLOADABLE_PROVIDER_IDS = ["youtube", "jiosaavn"] as const;

export function isDownloadableTrack(track: TrackMetadata) {
  return DOWNLOADABLE_PROVIDER_IDS.includes(
    track.ref.providerId as (typeof DOWNLOADABLE_PROVIDER_IDS)[number],
  );
}
