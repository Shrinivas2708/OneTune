import { Platform } from "react-native";
import { DownloadRecordSchema, type DownloadRecord } from "@/types/download-record";

const INDEX_KEY = "downloads.index";

type StringStorage = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
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
    };
  }

  const { MMKV } = require("react-native-mmkv") as typeof import("react-native-mmkv");
  const mmkv = new MMKV({ id: "vibevault-downloads" });

  return {
    getString: (key) => mmkv.getString(key),
    set: (key, value) => mmkv.set(key, value),
  };
}

const storage = createStorage();

export const downloadIndex = {
  loadAll(): DownloadRecord[] {
    const raw = storage.getString(INDEX_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as unknown[];
      return parsed
        .map((item) => DownloadRecordSchema.safeParse(item))
        .filter((result) => result.success)
        .map((result) => result.data);
    } catch {
      return [];
    }
  },

  saveAll(records: DownloadRecord[]) {
    storage.set(INDEX_KEY, JSON.stringify(records));
  },

  upsert(record: DownloadRecord) {
    const records = this.loadAll().filter((item) => item.id !== record.id);
    records.unshift(record);
    this.saveAll(records);
    return records;
  },

  remove(id: string) {
    const records = this.loadAll().filter((item) => item.id !== id);
    this.saveAll(records);
    return records;
  },

  getById(id: string) {
    return this.loadAll().find((item) => item.id === id) ?? null;
  },
};
