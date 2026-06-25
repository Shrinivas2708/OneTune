import { Platform } from "react-native";

type StringStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
};

function createStorage(): StringStorage {
  if (Platform.OS === "web") {
    return {
      getString: (key) => {
        if (typeof localStorage === "undefined") return undefined;
        return localStorage.getItem(key) ?? undefined;
      },
      set: (key, value) => {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(key, value);
        }
      },
      delete: (key) => {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(key);
        }
      },
    };
  }

  const { MMKV } = require("react-native-mmkv") as typeof import("react-native-mmkv");
  const mmkv = new MMKV({ id: "vibevault" });

  return {
    getString: (key) => mmkv.getString(key),
    set: (key, value) => mmkv.set(key, value),
    delete: (key) => mmkv.delete(key),
  };
}

const storage = createStorage();

const KEYS = {
  accessToken: "auth.accessToken",
  refreshToken: "auth.refreshToken",
  user: "auth.user",
} as const;

export const tokenStorage = {
  getAccessToken: () => storage.getString(KEYS.accessToken),
  getRefreshToken: () => storage.getString(KEYS.refreshToken),
  getUserJson: () => storage.getString(KEYS.user),
  setSession: (accessToken: string, refreshToken: string, userJson: string) => {
    storage.set(KEYS.accessToken, accessToken);
    storage.set(KEYS.refreshToken, refreshToken);
    storage.set(KEYS.user, userJson);
  },
  clear: () => {
    storage.delete(KEYS.accessToken);
    storage.delete(KEYS.refreshToken);
    storage.delete(KEYS.user);
  },
};
