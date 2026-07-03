import { useEffect, useRef } from "react";
import TrackPlayer, {
  Event,
  State,
  usePlaybackState,
  useProgress,
} from "react-native-track-player";
import { playerEngine } from "@/services/player-engine";
import {
  MIN_LISTEN_RECORD_MS,
  recordListenIfQualified,
} from "@/services/playback-history";
import { ensureQueuePreloader } from "@/services/queue-preloader";
import { trackKey, usePlayerStore } from "@/stores/player-store";

export function PlayerSync() {
  const playbackState = usePlaybackState();
  const progress = useProgress(500);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const queueLength = usePlayerStore((state) => state.queue.length);
  const lastAutoAdvanceKeyRef = useRef<string | null>(null);
  const listenStartedAtRef = useRef<number | null>(null);
  const recordedTrackKeyRef = useRef<string | null>(null);

  useEffect(() => {
    ensureQueuePreloader();
    void playerEngine.ensureSetup();
  }, []);

  useEffect(() => {
    if (!currentTrack) {
      listenStartedAtRef.current = null;
      recordedTrackKeyRef.current = null;
      return;
    }

    const key = trackKey(currentTrack);
    listenStartedAtRef.current = Date.now();
    recordedTrackKeyRef.current = null;

    const timer = setTimeout(() => {
      const active = usePlayerStore.getState().currentTrack;
      if (!active || trackKey(active) !== key) {
        return;
      }

      recordedTrackKeyRef.current = key;
      recordListenIfQualified(active, MIN_LISTEN_RECORD_MS, false);
    }, MIN_LISTEN_RECORD_MS);

    return () => {
      clearTimeout(timer);

      const startedAt = listenStartedAtRef.current;
      if (!startedAt || recordedTrackKeyRef.current === key) {
        return;
      }

      const listenedMs = Date.now() - startedAt;
      const recorded = recordListenIfQualified(
        currentTrack,
        listenedMs,
        recordedTrackKeyRef.current === key,
      );
      if (recorded) {
        recordedTrackKeyRef.current = key;
      }
    };
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack || !isPlaying) {
      return;
    }

    const key = trackKey(currentTrack);
    if (recordedTrackKeyRef.current === key) {
      return;
    }

    if (progress.position * 1000 < MIN_LISTEN_RECORD_MS) {
      return;
    }

    recordedTrackKeyRef.current = key;
    recordListenIfQualified(
      currentTrack,
      Math.round(progress.position * 1000),
      false,
    );
  }, [currentTrack, isPlaying, progress.position]);

  useEffect(() => {
    const subscription = TrackPlayer.addEventListener(
      Event.PlaybackQueueEnded,
      () => {
        void playerEngine.handleQueueEnded();
      },
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = TrackPlayer.addEventListener(
      Event.PlaybackActiveTrackChanged,
      (event) => {
        void playerEngine.handleNativeTrackChange(event.track?.id);
      },
    );

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    playerEngine.syncPlaybackState(playbackState.state);
  }, [playbackState.state]);

  useEffect(() => {
    if (playbackState.state !== State.Ended) {
      return;
    }

    void playerEngine.handleQueueEnded();
  }, [playbackState.state]);

  useEffect(() => {
    setProgress(progress.position, progress.duration);
  }, [progress.position, progress.duration, setProgress]);

  useEffect(() => {
    lastAutoAdvanceKeyRef.current = null;
  }, [currentTrack?.ref.externalId, currentTrack?.ref.providerId]);

  useEffect(() => {
    if (!currentTrack) {
      return;
    }

    const { duration, position } = progress;
    if (duration <= 0 || position < duration - 1) {
      return;
    }

    if (queueLength === 0) {
      usePlayerStore.getState().setIsPlaying(false);
      return;
    }

    const advanceKey = `${trackKey(currentTrack)}:${Math.round(duration)}`;
    if (lastAutoAdvanceKeyRef.current === advanceKey) {
      return;
    }

    lastAutoAdvanceKeyRef.current = advanceKey;
    void playerEngine.handleQueueEnded();
  }, [currentTrack, progress.duration, progress.position, queueLength]);

  useEffect(() => {
    const interval = setInterval(() => {
      void playerEngine.refreshExpiredStreamIfNeeded();
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
