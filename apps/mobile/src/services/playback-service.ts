import TrackPlayer, { Event } from "react-native-track-player";

export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    void TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    void TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    try {
      const activeIndex = await TrackPlayer.getActiveTrackIndex();
      const queue = await TrackPlayer.getQueue();
      if (activeIndex != null && activeIndex < queue.length - 1) {
        await TrackPlayer.skipToNext();
        return;
      }
    } catch {
      // Fall through to app queue handler.
    }

    const { playerEngine } = await import("./player-engine.native");
    await playerEngine.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    try {
      const progress = await TrackPlayer.getProgress();
      if (progress.position > 3) {
        await TrackPlayer.seekTo(0);
        return;
      }
    } catch {
      // Fall through.
    }

    await TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    void TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    void import("./player-engine.native").then(({ playerEngine }) =>
      playerEngine.handleQueueEnded(),
    );
  });
}
