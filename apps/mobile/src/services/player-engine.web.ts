import type { SearchResult, TrackMetadata } from "@vibevault/types";
import { isStreamExpired } from "@vibevault/utils";
import { getErrorMessage } from "@/lib/error-message";
import { resolvePlaybackUrl } from "@/lib/playback-url";
import {
  advanceQueue,
  beginPlaybackTransition,
  isActivePlaybackGeneration,
  prepareTrackTransition,
  removeTrackAndSkippedFromQueue,
  type QueueTransitionOptions,
} from "@/services/playback-core";
import {
  searchResultToTrack,
  usePlayerStore,
} from "@/stores/player-store";
import { showToast } from "@/stores/toast-store";
import { webAudioPlayer } from "./web-audio-player";

async function transitionToTrack(
  track: TrackMetadata,
  token: number,
  options: QueueTransitionOptions,
): Promise<boolean> {
  usePlayerStore.setState({ isResolving: true, resolveError: null });
  webAudioPlayer.pause();

  try {
    const prepared = await prepareTrackTransition(track, token);
    if (!prepared) return false;

    if (options.syncQueue) {
      removeTrackAndSkippedFromQueue(track);
    }

    const { playable, manifest } = prepared;

    usePlayerStore.setState({
      currentTrack: playable,
      streamManifest: manifest,
      isPlaying: true,
      resolveError: null,
      position: 0,
      duration: playable.durationMs ? playable.durationMs / 1000 : 0,
    });
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
  async ensureSetup() {},

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

    showToast("Offline downloads are available in the mobile app.", "info");
    throw new Error("Offline downloads are available in the mobile app.");
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
    webAudioPlayer.seek(0);
    usePlayerStore.getState().setProgress(0, usePlayerStore.getState().duration);
  },

  async playQueueIndex(index: number) {
    const queue = usePlayerStore.getState().queue;
    const track = queue[index];
    if (!track) return;

    const token = beginPlaybackTransition();
    await transitionToTrack(track, token, { syncQueue: true });
  },

  async play() {
    usePlayerStore.getState().setIsPlaying(true);
  },

  async pause() {
    usePlayerStore.getState().setIsPlaying(false);
  },

  async seekTo(position: number) {
    webAudioPlayer.seek(position);
    const { duration } = usePlayerStore.getState();
    usePlayerStore.getState().setProgress(position, duration);
  },

  async refreshExpiredStreamIfNeeded() {
    const { streamManifest, currentTrack, isPlaying } =
      usePlayerStore.getState();

    if (!streamManifest || !currentTrack || !isPlaying) return;
    if (!isStreamExpired(streamManifest.expiresAt)) return;

    const token = beginPlaybackTransition();
    const position = usePlayerStore.getState().position;
    const prepared = await prepareTrackTransition(currentTrack, token);
    if (!prepared) return;

    usePlayerStore.setState({ streamManifest: prepared.manifest });
    webAudioPlayer.load(resolvePlaybackUrl(prepared.manifest));
    webAudioPlayer.seek(position);
    await webAudioPlayer.play();
  },

  async handleQueueEnded() {
    const queue = usePlayerStore.getState().queue;
    if (queue.length === 0) {
      usePlayerStore.getState().setIsPlaying(false);
      return;
    }

    await this.skipToNext();
  },

  syncPlaybackState(_state?: unknown) {},
};

export const Event = {} as const;
export const State = {} as const;
