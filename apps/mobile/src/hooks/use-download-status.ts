import type { TrackMetadata } from "@vibevault/types";
import { findDownloadJob, findDownloadRecord } from "@/lib/download-lookup";
import { useDownloadStore } from "@/stores/download-store";

export function useDownloadStatus(track: TrackMetadata) {
  const records = useDownloadStore((state) => state.records);
  const jobs = useDownloadStore((state) => state.jobs);

  const record = findDownloadRecord(records, track);
  const job = findDownloadJob(jobs, records, track);
  const isDownloaded = record !== null;
  const isDownloading = job?.status === "downloading";
  const progress = isDownloading ? job.progress : isDownloaded ? 1 : 0;

  return {
    record,
    job,
    isDownloaded,
    isDownloading,
    isFailed: job?.status === "failed",
    progress,
  };
}
