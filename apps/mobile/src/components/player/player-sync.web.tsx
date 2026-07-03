import { useEffect, useRef } from "react";
import { resolvePlaybackUrl } from "@/lib/playback-url";
import { playerEngine } from "@/services/player-engine";
import {
  MIN_LISTEN_RECORD_MS,
  recordListenIfQualified,
} from "@/services/playback-history";
import { ensureQueuePreloader } from "@/services/queue-preloader";
import { trackKey } from "@/services/player-helpers";
import { webAudioPlayer } from "@/services/web-audio-player";
import { usePlayerStore } from "@/stores/player-store";
import { showToast } from "@/stores/toast-store";

export function PlayerSync() {
  const streamManifest = usePlayerStore((state) => state.streamManifest);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const listenStartedAtRef = useRef<number | null>(null);
  const recordedTrackKeyRef = useRef<string | null>(null);

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
    ensureQueuePreloader();
    webAudioPlayer.setVolume(usePlayerStore.getState().volume);
  }, []);

  useEffect(() => {
    webAudioPlayer.setListeners({
      onTimeUpdate: (position, duration) => {
        usePlayerStore.getState().setProgress(position, duration);
      },
      onEnded: () => {
        void playerEngine.handleQueueEnded();
      },
      onError: (message) => {
        usePlayerStore.getState().setIsPlaying(false);
        usePlayerStore.getState().setResolveError(message);
        showToast(message);
      },
    });
  }, []);

  useEffect(() => {
    webAudioPlayer.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (!streamManifest?.url) return;
    webAudioPlayer.load(resolvePlaybackUrl(streamManifest));
  }, [streamManifest?.url]);

  useEffect(() => {
    if (!streamManifest?.url) return;

    if (isPlaying) {
      void webAudioPlayer.play().catch(() => {
        const message = "Playback blocked or stream unavailable.";
        usePlayerStore.getState().setIsPlaying(false);
        usePlayerStore.getState().setResolveError(message);
        showToast(message);
      });
      return;
    }

    webAudioPlayer.pause();
  }, [isPlaying, streamManifest?.url]);

  return null;
}
