import { create } from "zustand";

interface PlayerUiState {
  isNowPlayingOpen: boolean;
  isQueueOpen: boolean;
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
  openQueue: () => void;
  closeQueue: () => void;
  toggleQueue: () => void;
}

export const usePlayerUiStore = create<PlayerUiState>((set, get) => ({
  isNowPlayingOpen: false,
  isQueueOpen: false,

  openNowPlaying: () => set({ isNowPlayingOpen: true, isQueueOpen: false }),
  closeNowPlaying: () => set({ isNowPlayingOpen: false, isQueueOpen: false }),
  openQueue: () => set({ isQueueOpen: true }),
  closeQueue: () => set({ isQueueOpen: false }),
  toggleQueue: () => set({ isQueueOpen: !get().isQueueOpen }),
}));
