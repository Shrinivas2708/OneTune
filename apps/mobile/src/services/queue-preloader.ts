import { preloadQueueTracks } from "@/lib/resolve-playable-track";
import { playerEngine } from "@/services/player-engine";
import { usePlayerStore } from "@/stores/player-store";

let started = false;
let preloadTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleQueuePreload() {
  if (preloadTimer) {
    clearTimeout(preloadTimer);
  }

  preloadTimer = setTimeout(() => {
    preloadTimer = null;
    const { queue, isResolving } = usePlayerStore.getState();
    if (queue.length === 0 || isResolving) {
      return;
    }

    void preloadQueueTracks(queue);
    void playerEngine.syncNativeQueue();
  }, 400);
}

export function ensureQueuePreloader() {
  if (started) return;
  started = true;

  usePlayerStore.subscribe((state, previous) => {
    if (state.queue === previous.queue && state.currentTrack === previous.currentTrack) {
      return;
    }

    scheduleQueuePreload();
  });
}
