import type { SearchResult, TrackMetadata } from "@vibevault/types";
import * as FileSystem from "expo-file-system/legacy";
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
} from "react-native-track-player";
import { getErrorMessage } from "@/lib/error-message";
import { downloadManager } from "@/services/download-manager";
import { resolvePlayableTrack } from "@/lib/resolve-playable-track";
import {
  clearNativeTrackLinks,
  linkNativeTrack,
  takeNativeTrackLink,
} from "@/services/native-queue-bridge";
import {
  advanceQueue,
  beginPlaybackTransition,
  isActivePlaybackGeneration,
  prepareTrackTransition,
  removeTrackAndSkippedFromQueue,
  type QueueTransitionOptions,
} from "@/services/playback-core";
import {
  isQueueAdvanceSuppressed,
  withQueueAdvanceSuppressed,
} from "@/services/playback-session";
import {
  searchResultToTrack,
  usePlayerStore,
} from "@/stores/player-store";
import { showToast } from "@/stores/toast-store";
import {
  isLocalPlaybackSource,
  toPlayerTrack,
  trackKey,
  type PlaybackSource,
} from "./player-helpers";
import { manifestCache } from "@/lib/manifest-cache";
import { musicApi } from "@/lib/music-api";
import { isStreamExpired } from "@vibevault/utils";

let setupPromise: Promise<void> | null = null;

async function resolvePlaybackSource(
  track: TrackMetadata,
): Promise<PlaybackSource> {
  const key = trackKey(track);
  const local = downloadManager.getLocalRecordForTrack(track);

  if (local) {
    const info = await FileSystem.getInfoAsync(local.localPath);
    if (info.exists) {
      return { kind: "local", fileUri: local.fileUri };
    }
  }

  try {
    const cached = manifestCache.get(key);
    let manifest = cached && !isStreamExpired(cached.expiresAt) ? cached : null;

    if (!manifest) {
      manifest = await musicApi.resolveStream({ trackRef: track.ref });
      manifestCache.set(key, manifest);
    }

    return { kind: "stream", manifest };
  } catch (error) {
    const fallback = downloadManager.getLocalRecordForTrack(track);
    if (fallback) {
      const info = await FileSystem.getInfoAsync(fallback.localPath);
      if (info.exists) {
        return { kind: "local", fileUri: fallback.fileUri };
      }
    }

    throw error;
  }
}

let queueAdvanceInFlight = false;
let lastQueueAdvanceAt = 0;

async function startNativePlayback(
  playable: TrackMetadata,
  manifest: PlaybackSource,
  queueTrack?: TrackMetadata,
) {
  await withQueueAdvanceSuppressed(async () => {
    const playerTrack = toPlayerTrack(playable, manifest);

    await TrackPlayer.reset();
    clearNativeTrackLinks();
    await TrackPlayer.setQueue([playerTrack]);
    linkNativeTrack(playerTrack.id!, queueTrack ?? playable, playable);
    await TrackPlayer.play();

    usePlayerStore.setState({
      currentTrack: playable,
      streamManifest: manifest.kind === "stream" ? manifest.manifest : null,
      isLocalPlayback: isLocalPlaybackSource(manifest),
      isPlaying: true,
      resolveError: null,
    });

    await playerEngine.syncNativeQueue();
  });
}

async function transitionToTrack(
  track: TrackMetadata,
  token: number,
  options: QueueTransitionOptions,
): Promise<boolean> {
  await playerEngine.ensureSetup();
  usePlayerStore.setState({ isResolving: true, resolveError: null });

  try {
    await TrackPlayer.pause();

    const local = downloadManager.getLocalRecordForTrack(track);
    if (local) {
      const info = await FileSystem.getInfoAsync(local.localPath);
      if (info.exists) {
        if (!isActivePlaybackGeneration(token)) return false;

        if (options.syncQueue) {
          removeTrackAndSkippedFromQueue(track);
        }

        await startNativePlayback(
          local.track,
          {
            kind: "local",
            fileUri: local.fileUri,
          },
          track,
        );
        return true;
      }
    }

    const prepared = await prepareTrackTransition(track, token);
    if (!prepared) return false;

    if (options.syncQueue) {
      removeTrackAndSkippedFromQueue(track);
    }

    const source = await resolvePlaybackSource(prepared.playable);
    if (!isActivePlaybackGeneration(token)) return false;

    await startNativePlayback(prepared.playable, source, track);
    return true;
  } catch (error) {
    if (!isActivePlaybackGeneration(token)) return false;

    const message = getErrorMessage(error, "Could not start playback.");
    usePlayerStore.getState().setIsPlaying(false);
    if (!options.quiet) {
      usePlayerStore.getState().setResolveError(message);
      showToast(message);
    }
    return false;
  } finally {
    if (isActivePlaybackGeneration(token)) {
      usePlayerStore.getState().setIsResolving(false);
    }
  }
}

export const playerEngine = {
  async ensureSetup() {
    if (!setupPromise) {
      setupPromise = (async () => {
        await TrackPlayer.setupPlayer({
          autoHandleInterruptions: true,
        });

        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.ContinuePlayback,
            alwaysPauseOnInterruption: true,
          },
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
          ],
          progressUpdateEventInterval: 1,
        });
      })();
    }

    return setupPromise;
  },

  async playSearchResult(
    result: SearchResult,
    options?: { keepQueue?: boolean },
  ) {
    if (!options?.keepQueue) {
      usePlayerStore.getState().setQueue([]);
    }

    const token = beginPlaybackTransition();
    await transitionToTrack(searchResultToTrack(result), token, {
      syncQueue: false,
    });
  },

  async playDownloadedTrack(
    track: TrackMetadata,
    options?: { keepQueue?: boolean },
  ) {
    if (!options?.keepQueue) {
      usePlayerStore.getState().setQueue([]);
    }

    const token = beginPlaybackTransition();
    await this.ensureSetup();
    usePlayerStore.setState({ isResolving: true, resolveError: null });

    try {
      await TrackPlayer.pause();

      const local = downloadManager.getLocalRecordForTrack(track);
      if (!local) {
        throw new Error("Downloaded file not found. Download the track again.");
      }

      const info = await FileSystem.getInfoAsync(local.localPath);
      if (!info.exists) {
        throw new Error("Downloaded file is missing. Download the track again.");
      }

      if (!isActivePlaybackGeneration(token)) return;

      await startNativePlayback(
        local.track,
        {
          kind: "local",
          fileUri: local.fileUri,
        },
        track,
      );
    } catch (error) {
      if (!isActivePlaybackGeneration(token)) return;

      const message = getErrorMessage(error, "Could not start offline playback.");
      usePlayerStore.getState().setIsPlaying(false);
      usePlayerStore.getState().setResolveError(message);
      showToast(message);
    } finally {
      if (isActivePlaybackGeneration(token)) {
        usePlayerStore.getState().setIsResolving(false);
      }
    }
  },

  async addToQueue(result: SearchResult) {
    const added = usePlayerStore.getState().addToQueue(searchResultToTrack(result));
    if (added) {
      showToast("Added to queue");
      return;
    }

    showToast("Already playing or queued");
  },

  async skipToNext() {
    const token = beginPlaybackTransition();
    await advanceQueue(transitionToTrack, token);
  },

  async skipToPrevious() {
    await this.ensureSetup();

    const progress = await TrackPlayer.getProgress();
    if (progress.position > 3) {
      await TrackPlayer.seekTo(0);
      usePlayerStore.getState().setProgress(0, usePlayerStore.getState().duration);
      return;
    }

    await TrackPlayer.skipToPrevious();
  },

  async syncNativeQueue() {
    await this.ensureSetup();

    const { queue } = usePlayerStore.getState();
    const nextQueueTrack = queue[0];
    if (!nextQueueTrack) {
      return;
    }

    try {
      const tpQueue = await TrackPlayer.getQueue();
      const activeIndex = await TrackPlayer.getActiveTrackIndex() ?? 0;
      const upcomingIds = new Set(
        tpQueue.slice(activeIndex + 1).map((track) => track.id).filter(Boolean),
      );

      const playable = await resolvePlayableTrack(nextQueueTrack);
      const nextId = trackKey(playable);
      if (upcomingIds.has(nextId)) {
        return;
      }

      const source = await resolvePlaybackSource(playable);
      const playerTrack = toPlayerTrack(playable, source);
      linkNativeTrack(playerTrack.id!, nextQueueTrack, playable);
      await TrackPlayer.add(playerTrack);
    } catch {
      // Best-effort preload for lock-screen skip.
    }
  },

  async handleNativeTrackChange(trackId: string | undefined) {
    if (!trackId) {
      return;
    }

    const { currentTrack } = usePlayerStore.getState();
    if (currentTrack && trackKey(currentTrack) === trackId) {
      return;
    }

    const link = takeNativeTrackLink(trackId);
    if (!link) {
      return;
    }

    removeTrackAndSkippedFromQueue(link.queueTrack);

    const local = downloadManager.getLocalRecordForTrack(link.playable);
    const isLocal = Boolean(local);

    usePlayerStore.setState({
      currentTrack: link.playable,
      streamManifest: isLocal
        ? null
        : manifestCache.get(trackKey(link.playable)) ?? null,
      isLocalPlayback: isLocal,
      isPlaying: true,
      resolveError: null,
    });

    await this.syncNativeQueue();
  },

  async playQueueIndex(index: number) {
    const queue = usePlayerStore.getState().queue;
    const track = queue[index];
    if (!track) return;

    const token = beginPlaybackTransition();
    await transitionToTrack(track, token, { syncQueue: true });
  },

  async play() {
    await TrackPlayer.play();
    usePlayerStore.getState().setIsPlaying(true);
  },

  async pause() {
    await TrackPlayer.pause();
    usePlayerStore.getState().setIsPlaying(false);
  },

  async seekTo(position: number) {
    await TrackPlayer.seekTo(position);
  },

  async refreshExpiredStreamIfNeeded() {
    const { streamManifest, currentTrack, isPlaying, isLocalPlayback } =
      usePlayerStore.getState();

    if (isLocalPlayback || !streamManifest || !currentTrack || !isPlaying) {
      return;
    }

    if (!isStreamExpired(streamManifest.expiresAt)) {
      return;
    }

    const index = await TrackPlayer.getActiveTrackIndex();
    if (index === undefined) {
      return;
    }

    const progress = await TrackPlayer.getProgress();
    const source = await resolvePlaybackSource(currentTrack);

    if (source.kind === "local") {
      usePlayerStore.setState({ isLocalPlayback: true, streamManifest: null });
      return;
    }

    const playerTrack = toPlayerTrack(currentTrack, source);

    await withQueueAdvanceSuppressed(async () => {
      await TrackPlayer.pause();
      await TrackPlayer.reset();
      await TrackPlayer.setQueue([playerTrack]);
      await TrackPlayer.skip(0, progress.position);
      await TrackPlayer.play();
    });

    usePlayerStore.getState().setStreamManifest(source.manifest);
  },

  async replayCurrent() {
    await this.ensureSetup();

    const progress = await TrackPlayer.getProgress();
    if (progress.position > 1) {
      await TrackPlayer.seekTo(0);
      await TrackPlayer.play();
      usePlayerStore.getState().setProgress(0, usePlayerStore.getState().duration);
      usePlayerStore.getState().setIsPlaying(true);
      return;
    }

    const { currentTrack } = usePlayerStore.getState();
    if (!currentTrack) {
      return;
    }

    const token = beginPlaybackTransition();
    await transitionToTrack(currentTrack, token, { syncQueue: false, quiet: true });
  },

  async handleQueueEnded() {
    if (isQueueAdvanceSuppressed()) {
      return;
    }

    const { isResolving, queue, repeatMode, currentTrack } =
      usePlayerStore.getState();
    if (isResolving) {
      return;
    }

    if (repeatMode === "one" && currentTrack) {
      const now = Date.now();
      if (queueAdvanceInFlight || now - lastQueueAdvanceAt < 1000) {
        return;
      }

      queueAdvanceInFlight = true;
      lastQueueAdvanceAt = now;
      try {
        await this.replayCurrent();
      } finally {
        queueAdvanceInFlight = false;
      }
      return;
    }

    const now = Date.now();
    if (queueAdvanceInFlight || now - lastQueueAdvanceAt < 1000) {
      return;
    }

    if (queue.length === 0) {
      usePlayerStore.getState().setIsPlaying(false);
      return;
    }

    queueAdvanceInFlight = true;
    lastQueueAdvanceAt = now;

    try {
      await this.skipToNext();
    } finally {
      queueAdvanceInFlight = false;
    }
  },

  syncPlaybackState(state: State | undefined) {
    if (!state) {
      return;
    }

    const isPlaying =
      state === State.Playing ||
      state === State.Buffering ||
      state === State.Loading;

    usePlayerStore.getState().setIsPlaying(isPlaying);
  },
};

export { Event, State };
