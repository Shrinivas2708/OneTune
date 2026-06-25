import type { StreamManifest } from "@vibevault/types";

const cache = new Map<string, StreamManifest>();

export function manifestCacheKey(providerId: string, externalId: string) {
  return `${providerId}:${externalId}`;
}

export const manifestCache = {
  get(key: string) {
    return cache.get(key);
  },
  set(key: string, manifest: StreamManifest) {
    cache.set(key, manifest);
  },
  delete(key: string) {
    cache.delete(key);
  },
  clear() {
    cache.clear();
  },
};
