import { create } from "zustand";

export type ToastType = "error" | "success" | "info";

interface ToastState {
  message: string | null;
  type: ToastType;
  show: (message: string, type?: ToastType) => void;
  dismiss: () => void;
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "error",
  show: (message, type = "error") => {
    if (dismissTimer) clearTimeout(dismissTimer);
    set({ message, type });
    dismissTimer = setTimeout(() => {
      set({ message: null });
      dismissTimer = null;
    }, 3500);
  },
  dismiss: () => {
    if (dismissTimer) clearTimeout(dismissTimer);
    dismissTimer = null;
    set({ message: null });
  },
}));

export function showToast(message: string, type: ToastType = "error") {
  useToastStore.getState().show(message, type);
}
