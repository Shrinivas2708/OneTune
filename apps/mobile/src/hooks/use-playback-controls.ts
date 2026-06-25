import { useCallback } from "react";
import { playerEngine } from "@/services/player-engine";
import { usePlayerStore } from "@/stores/player-store";

export function usePlaybackControls() {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const position = usePlayerStore((state) => state.position);
  const duration = usePlayerStore((state) => state.duration);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);

  const play = useCallback(() => {
    void playerEngine.play();
  }, []);

  const pause = useCallback(() => {
    void playerEngine.pause();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      void playerEngine.pause();
      return;
    }
    void playerEngine.play();
  }, [isPlaying]);

  const skipToNext = useCallback(() => {
    void playerEngine.skipToNext();
  }, []);

  const skipToPrevious = useCallback(() => {
    void playerEngine.skipToPrevious();
  }, []);

  const playQueueIndex = useCallback((index: number) => {
    void playerEngine.playQueueIndex(index);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    void playerEngine.seekTo(seconds);
  }, []);

  const hasNext = currentIndex < queue.length - 1;
  const hasPrevious = currentIndex > 0;

  return {
    isPlaying,
    position,
    duration,
    currentTrack,
    queue,
    currentIndex,
    hasNext,
    hasPrevious,
    play,
    pause,
    toggle,
    skipToNext,
    skipToPrevious,
    seekTo,
    playQueueIndex,
  };
}
