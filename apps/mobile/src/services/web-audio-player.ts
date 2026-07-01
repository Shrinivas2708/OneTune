type AudioListeners = {
  onTimeUpdate?: (position: number, duration: number) => void;
  onEnded?: () => void;
  onError?: (message: string) => void;
};

let audio: HTMLAudioElement | null = null;
let loadedUrl: string | null = null;
let listeners: AudioListeners = {};
let volume = 1;

function getAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;

  if (!audio) {
    audio = new Audio();
    audio.preload = "auto";
    audio.volume = volume;

    audio.addEventListener("timeupdate", () => {
      const position = audio!.currentTime;
      const duration = Number.isFinite(audio!.duration) ? audio!.duration : 0;
      listeners.onTimeUpdate?.(position, duration);
    });

    audio.addEventListener("ended", () => {
      listeners.onEnded?.();
    });

    audio.addEventListener("error", () => {
      listeners.onError?.("Could not play this stream.");
    });
  }

  return audio;
}

export const webAudioPlayer = {
  setListeners(next: AudioListeners) {
    listeners = next;
  },

  setVolume(nextVolume: number) {
    volume = Math.min(1, Math.max(0, nextVolume));
    const element = getAudio();
    if (element) {
      element.volume = volume;
    }
  },

  getVolume() {
    return volume;
  },

  load(url: string) {
    const element = getAudio();
    if (!element || !url) return;

    if (loadedUrl === url) return;

    loadedUrl = url;
    element.src = url;
    element.volume = volume;
    element.load();
  },

  async play(): Promise<void> {
    const element = getAudio();
    if (!element?.src) return;
    element.volume = volume;
    await element.play();
  },

  pause() {
    getAudio()?.pause();
  },

  seek(seconds: number) {
    const element = getAudio();
    if (element) {
      element.currentTime = seconds;
    }
  },

  stop() {
    const element = getAudio();
    if (!element) return;

    element.pause();
    element.removeAttribute("src");
    element.load();
    loadedUrl = null;
  },
};
