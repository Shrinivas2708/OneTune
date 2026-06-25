import type { SearchResult } from "@vibevault/types";
import { musicApi } from "@/lib/music-api";
import {
  searchResultToTrack,
  usePlayerStore,
} from "@/stores/player-store";
import { trackKey } from "./player-helpers";

export const playerEngine = {
  async ensureSetup() {},

  async playSearchResult(result: SearchResult) {
    const track = searchResultToTrack(result);
    const manifest = await musicApi.resolveStream({ trackRef: track.ref });
    const key = trackKey(track);
    const state = usePlayerStore.getState();
    const queue = state.queue.filter((item) => trackKey(item) !== key);

    usePlayerStore.setState({
      queue: [...queue, track],
      currentTrack: track,
      currentIndex: queue.length,
      streamManifest: manifest,
      isPlaying: true,
      resolveError: null,
    });
  },

  async skipToNext() {},
  async skipToPrevious() {},
  async playQueueIndex(index: number) {
    const { queue } = usePlayerStore.getState();
    const track = queue[index];
    if (!track) return;

    usePlayerStore.setState({
      currentTrack: track,
      currentIndex: index,
      isPlaying: true,
    });
  },
  async play() {
    usePlayerStore.getState().setIsPlaying(true);
  },
  async pause() {
    usePlayerStore.getState().setIsPlaying(false);
  },
  async seekTo(_position: number) {},
  async refreshExpiredStreamIfNeeded() {},
  async handleQueueEnded() {},
  syncPlaybackState(_state?: unknown) {},
};

export const Event = {} as const;
export const State = {} as const;
