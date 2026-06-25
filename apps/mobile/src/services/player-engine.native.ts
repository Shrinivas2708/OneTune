import type { SearchResult, TrackMetadata } from "@vibevault/types";
import { isStreamExpired } from "@vibevault/utils";
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
} from "react-native-track-player";
import { manifestCache } from "@/lib/manifest-cache";
import { musicApi } from "@/lib/music-api";
import {
  searchResultToTrack,
  usePlayerStore,
} from "@/stores/player-store";
import { toPlayerTrack, trackKey } from "./player-helpers";

let setupPromise: Promise<void> | null = null;

async function resolveManifest(track: TrackMetadata) {
  const key = trackKey(track);
  const cached = manifestCache.get(key);

  if (cached && !isStreamExpired(cached.expiresAt)) {
    return cached;
  }

  const manifest = await musicApi.resolveStream({ trackRef: track.ref });
  manifestCache.set(key, manifest);
  return manifest;
}

async function playTrackAtIndex(index: number) {
  const queue = usePlayerStore.getState().queue;
  const track = queue[index];

  if (!track) {
    return;
  }

  const manifest = await resolveManifest(track);
  const playerTrack = toPlayerTrack(track, manifest);

  await TrackPlayer.reset();
  await TrackPlayer.setQueue([playerTrack]);
  await TrackPlayer.play();

  usePlayerStore.setState({
    currentIndex: index,
    currentTrack: track,
    streamManifest: manifest,
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

    const track = searchResultToTrack(result);
    const key = trackKey(track);
    const state = usePlayerStore.getState();
    const existingIndex = state.queue.findIndex((item) => trackKey(item) === key);

    let queue = [...state.queue];
    if (existingIndex === -1) {
      queue.push(track);
    }

    const playIndex = existingIndex === -1 ? queue.length - 1 : existingIndex;
    usePlayerStore.setState({ queue });

    await playTrackAtIndex(playIndex);
  },

  async skipToNext() {
    const { currentIndex, queue } = usePlayerStore.getState();
    if (currentIndex >= queue.length - 1) {
      return;
    }

    await playTrackAtIndex(currentIndex + 1);
  },

  async skipToPrevious() {
    const { currentIndex } = usePlayerStore.getState();
    if (currentIndex <= 0) {
      await TrackPlayer.seekTo(0);
      return;
    }

    await playTrackAtIndex(currentIndex - 1);
  },

  async playQueueIndex(index: number) {
    const { queue } = usePlayerStore.getState();
    if (index < 0 || index >= queue.length) {
      return;
    }

    await playTrackAtIndex(index);
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
    const { streamManifest, currentTrack, isPlaying } = usePlayerStore.getState();

    if (!streamManifest || !currentTrack || !isPlaying) {
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
    const manifest = await resolveManifest(currentTrack);
    const playerTrack = toPlayerTrack(currentTrack, manifest);

    await TrackPlayer.pause();
    await TrackPlayer.reset();
    await TrackPlayer.setQueue([playerTrack]);
    await TrackPlayer.skip(0, progress.position);
    await TrackPlayer.play();

    usePlayerStore.getState().setStreamManifest(manifest);
  },

  async handleQueueEnded() {
    const { currentIndex, queue } = usePlayerStore.getState();
    if (currentIndex < queue.length - 1) {
      await this.skipToNext();
      return;
    }

    usePlayerStore.getState().setIsPlaying(false);
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
