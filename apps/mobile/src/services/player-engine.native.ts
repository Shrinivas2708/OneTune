import type { SearchResult, TrackMetadata } from "@vibevault/types";
import { isStreamExpired } from "@vibevault/utils";
import * as FileSystem from "expo-file-system/legacy";
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
} from "react-native-track-player";
import { manifestCache } from "@/lib/manifest-cache";
import { musicApi } from "@/lib/music-api";
import { resolvePlayableResult } from "@/lib/resolve-playable-track";
import { trackToSearchResult } from "@/lib/track-to-search-result";
import { downloadManager } from "@/services/download-manager";
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

let setupPromise: Promise<void> | null = null;

async function resolveStreamManifest(track: TrackMetadata) {
  const key = trackKey(track);
  const cached = manifestCache.get(key);

  if (cached && !isStreamExpired(cached.expiresAt)) {
    return cached;
  }

  const manifest = await musicApi.resolveStream({ trackRef: track.ref });
  manifestCache.set(key, manifest);
  return manifest;
}

async function resolvePlaybackSource(
  track: TrackMetadata,
): Promise<PlaybackSource> {
  const key = trackKey(track);
  const local = downloadManager.getLocalRecord(key);

  if (local) {
    const info = await FileSystem.getInfoAsync(local.localPath);
    if (info.exists) {
      return { kind: "local", fileUri: local.fileUri };
    }
  }

  const manifest = await resolveStreamManifest(track);
  return { kind: "stream", manifest };
}

async function playNow(track: TrackMetadata) {
  const playable = searchResultToTrack(
    await resolvePlayableResult(trackToSearchResult(track)),
  );
  const source = await resolvePlaybackSource(playable);
  const playerTrack = toPlayerTrack(playable, source);

  await TrackPlayer.reset();
  await TrackPlayer.setQueue([playerTrack]);
  await TrackPlayer.play();

  usePlayerStore.setState({
    currentTrack: playable,
    streamManifest: source.kind === "stream" ? source.manifest : null,
    isLocalPlayback: isLocalPlaybackSource(source),
    isPlaying: true,
    resolveError: null,
  });
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

  async playSearchResult(result: SearchResult) {
    await this.ensureSetup();
    await playNow(searchResultToTrack(result));
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
    await this.ensureSetup();

    const queue = usePlayerStore.getState().queue;
    if (queue.length === 0) return;

    const [next, ...rest] = queue;
    usePlayerStore.setState({ queue: rest });
    await playNow(next);
  },

  async skipToPrevious() {
    await this.ensureSetup();
    await TrackPlayer.seekTo(0);
    usePlayerStore.getState().setProgress(0, usePlayerStore.getState().duration);
  },

  async playQueueIndex(index: number) {
    await this.ensureSetup();

    const queue = usePlayerStore.getState().queue;
    const track = queue[index];
    if (!track) return;

    const rest = queue.filter((_, itemIndex) => itemIndex !== index);
    usePlayerStore.setState({ queue: rest });
    await playNow(track);
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

    await TrackPlayer.pause();
    await TrackPlayer.reset();
    await TrackPlayer.setQueue([playerTrack]);
    await TrackPlayer.skip(0, progress.position);
    await TrackPlayer.play();

    usePlayerStore.getState().setStreamManifest(source.manifest);
  },

  async handleQueueEnded() {
    const queue = usePlayerStore.getState().queue;
    if (queue.length === 0) {
      usePlayerStore.getState().setIsPlaying(false);
      return;
    }

    await this.skipToNext();
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
