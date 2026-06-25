import TrackPlayer, { Event } from "react-native-track-player";
import { playerEngine } from "./player-engine";

export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    void playerEngine.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    void playerEngine.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    void playerEngine.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    void playerEngine.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    void playerEngine.seekTo(event.position);
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    void playerEngine.handleQueueEnded();
  });
}
