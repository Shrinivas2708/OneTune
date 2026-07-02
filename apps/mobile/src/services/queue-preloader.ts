import { usePlayerStore } from "@/stores/player-store";
import { preloadQueueTracks } from "@/lib/resolve-playable-track";
import { playerEngine } from "@/services/player-engine";

let started = false;

export function ensureQueuePreloader() {
  if (started) return;
  started = true;

  usePlayerStore.subscribe((state, previous) => {
    if (state.queue === previous.queue && state.currentTrack === previous.currentTrack) {
      return;
    }

    void preloadQueueTracks(state.queue);
    void playerEngine.syncNativeQueue();
  });

  void preloadQueueTracks(usePlayerStore.getState().queue);
  void playerEngine.syncNativeQueue();
}
