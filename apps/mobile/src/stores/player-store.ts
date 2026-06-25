import type { SearchResult, TrackMetadata, StreamManifest } from "@vibevault/types";
import { create } from "zustand";
import { manifestCache } from "@/lib/manifest-cache";
import { trackKey } from "@/services/player-helpers";

interface PlayerState {
  currentTrack: TrackMetadata | null;
  currentIndex: number;
  streamManifest: StreamManifest | null;
  isPlaying: boolean;
  isResolving: boolean;
  isLocalPlayback: boolean;
  resolveError: string | null;
  position: number;
  duration: number;
  queue: TrackMetadata[];
  setCurrentTrack: (track: TrackMetadata | null) => void;
  setCurrentIndex: (index: number) => void;
  setStreamManifest: (manifest: StreamManifest | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsResolving: (isResolving: boolean) => void;
  setResolveError: (error: string | null) => void;
  setProgress: (position: number, duration: number) => void;
  enqueueTrack: (track: TrackMetadata) => void;
  setQueue: (tracks: TrackMetadata[]) => void;
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
  currentIndex: -1,
  streamManifest: null,
  isPlaying: false,
  isResolving: false,
  isLocalPlayback: false,
  resolveError: null,
  position: 0,
  duration: 0,
  queue: [],

  setCurrentTrack: (track) => set({ currentTrack: track }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setStreamManifest: (manifest) => set({ streamManifest: manifest }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsResolving: (isResolving) => set({ isResolving }),
  setResolveError: (error) => set({ resolveError: error }),
  setProgress: (position, duration) => set({ position, duration }),

  enqueueTrack: (track) => {
    const key = trackKey(track);
    const queue = get().queue.filter((item) => trackKey(item) !== key);
    const nextQueue = [...queue, track];
    set({
      queue: nextQueue,
      currentTrack: track,
      currentIndex: nextQueue.length - 1,
    });
  },

  setQueue: (tracks) => set({ queue: tracks }),

  reset: () => {
    manifestCache.clear();
    set({
      currentTrack: null,
      currentIndex: -1,
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
