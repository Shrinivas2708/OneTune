import type { SearchResult, TrackMetadata, StreamManifest } from "@vibevault/types";
import { create } from "zustand";
import { manifestCache } from "@/lib/manifest-cache";
import { loadWebVolume, saveWebVolume } from "@/lib/web-volume";
import { trackKey } from "@/services/player-helpers";

export type RepeatMode = "off" | "one";

interface PlayerState {
  currentTrack: TrackMetadata | null;
  streamManifest: StreamManifest | null;
  isPlaying: boolean;
  isResolving: boolean;
  isLocalPlayback: boolean;
  resolveError: string | null;
  position: number;
  duration: number;
  volume: number;
  /** Tracks explicitly added to play later — never includes the current track. */
  queue: TrackMetadata[];
  repeatMode: RepeatMode;
  setCurrentTrack: (track: TrackMetadata | null) => void;
  setStreamManifest: (manifest: StreamManifest | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsResolving: (isResolving: boolean) => void;
  setResolveError: (error: string | null) => void;
  setProgress: (position: number, duration: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: TrackMetadata) => boolean;
  removeFromQueue: (index: number) => void;
  setQueue: (tracks: TrackMetadata[]) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleRepeatMode: () => void;
  reset: () => void;
}

export function searchResultToTrack(result: SearchResult): TrackMetadata {
  return {
    ref: result.ref,
    title: result.title,
    artists: result.artists,
    album: result.album,
    artworkUrl: result.artworkUrl,
    durationMs: result.durationMs,
    isVideo: result.isVideo,
    releaseYear: result.releaseYear,
  };
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  streamManifest: null,
  isPlaying: false,
  isResolving: false,
  isLocalPlayback: false,
  resolveError: null,
  position: 0,
  duration: 0,
  volume: loadWebVolume(),
  queue: [],
  repeatMode: "off",

  setCurrentTrack: (track) => set({ currentTrack: track }),
  setStreamManifest: (manifest) => set({ streamManifest: manifest }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsResolving: (isResolving) => set({ isResolving }),
  setResolveError: (error) => set({ resolveError: error }),
  setProgress: (position, duration) => set({ position, duration }),

  setVolume: (volume) => {
    const clamped = Math.min(1, Math.max(0, volume));
    saveWebVolume(clamped);
    set({ volume: clamped });
  },

  addToQueue: (track) => {
    const key = trackKey(track);
    const { currentTrack, queue } = get();

    if (currentTrack && trackKey(currentTrack) === key) {
      return false;
    }

    if (queue.some((item) => trackKey(item) === key)) {
      return false;
    }

    set({ queue: [...queue, track] });
    return true;
  },

  removeFromQueue: (index) => {
    const queue = get().queue.filter((_, itemIndex) => itemIndex !== index);
    set({ queue });
  },

  setQueue: (tracks) => set({ queue: tracks }),

  setRepeatMode: (mode) => set({ repeatMode: mode }),

  toggleRepeatMode: () =>
    set((state) => ({
      repeatMode: state.repeatMode === "off" ? "one" : "off",
    })),

  reset: () => {
    manifestCache.clear();
    set({
      currentTrack: null,
      streamManifest: null,
      isPlaying: false,
      isResolving: false,
      isLocalPlayback: false,
      resolveError: null,
      position: 0,
      duration: 0,
      queue: [],
    });
  },
}));

export { trackKey };
