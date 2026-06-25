import { MiniPlayer } from "./mini-player";
import { NowPlayingModal } from "./now-playing-modal";

export function PlayerChrome() {
  return (
    <>
      <MiniPlayer />
      <NowPlayingModal />
    </>
  );
}
