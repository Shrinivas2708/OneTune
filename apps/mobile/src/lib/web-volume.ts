const STORAGE_KEY = "vibevault-volume";

export function loadWebVolume(): number {
  if (typeof window === "undefined") return 1;

  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return 1;

  const value = Number.parseFloat(stored);
  if (!Number.isFinite(value)) return 1;

  return Math.min(1, Math.max(0, value));
}

export function saveWebVolume(volume: number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, String(volume));
}
