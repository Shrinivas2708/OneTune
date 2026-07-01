import type { SearchResult, TrackMetadata } from "@vibevault/types";
import { isStreamExpired } from "@vibevault/utils";
import { manifestCache } from "@/lib/manifest-cache";
import { musicApi } from "@/lib/music-api";
import { resolvePlaybackUrl } from "@/lib/playback-url";
import {
  searchResultToTrack,
  usePlayerStore,
} from "@/stores/player-store";
import { showToast } from "@/stores/toast-store";
import { trackKey } from "./player-helpers";
import { webAudioPlayer } from "./web-audio-player";

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

async function playNow(track: TrackMetadata) {
  const manifest = await resolveStreamManifest(track);

  usePlayerStore.setState({
    currentTrack: track,
    streamManifest: manifest,
    isPlaying: true,
    resolveError: null,
    position: 0,
    duration: track.durationMs ? track.durationMs / 1000 : 0,
  });
}

export const playerEngine = {
  async ensureSetup() {},

  async playSearchResult(result: SearchResult) {
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
    const queue = usePlayerStore.getState().queue;
    if (queue.length === 0) return;

    const [next, ...rest] = queue;
    usePlayerStore.setState({ queue: rest });
    await playNow(next);
  },

  async skipToPrevious() {
    webAudioPlayer.seek(0);
    usePlayerStore.getState().setProgress(0, usePlayerStore.getState().duration);
  },

  async playQueueIndex(index: number) {
    const queue = usePlayerStore.getState().queue;
    const track = queue[index];
    if (!track) return;

    const rest = queue.filter((_, itemIndex) => itemIndex !== index);
    usePlayerStore.setState({ queue: rest });
    await playNow(track);
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

    const position = usePlayerStore.getState().position;
    const manifest = await resolveStreamManifest(currentTrack);
    usePlayerStore.setState({ streamManifest: manifest });
    webAudioPlayer.load(resolvePlaybackUrl(manifest));
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
