import { useEffect } from "react";
import { State, usePlaybackState, useProgress } from "react-native-track-player";
import { playerEngine } from "@/services/player-engine";
import { ensureQueuePreloader } from "@/services/queue-preloader";
import { usePlayerStore } from "@/stores/player-store";

export function PlayerSync() {
  const playbackState = usePlaybackState();
  const progress = useProgress(500);
  const setProgress = usePlayerStore((state) => state.setProgress);

  useEffect(() => {
    ensureQueuePreloader();
    void playerEngine.ensureSetup();
  }, []);

  useEffect(() => {
    playerEngine.syncPlaybackState(playbackState.state);
  }, [playbackState.state]);

  useEffect(() => {
    setProgress(progress.position, progress.duration);
  }, [progress.position, progress.duration, setProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      void playerEngine.refreshExpiredStreamIfNeeded();
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
