import type { TrackMetadata } from "@vibevault/types";

interface NativeQueueLink {
  queueTrack: TrackMetadata;
  playable: TrackMetadata;
}

const links = new Map<string, NativeQueueLink>();

export function linkNativeTrack(
  id: string,
  queueTrack: TrackMetadata,
  playable: TrackMetadata,
) {
  links.set(id, { queueTrack, playable });
}

export function takeNativeTrackLink(id: string): NativeQueueLink | null {
  const link = links.get(id) ?? null;
  if (link) {
    links.delete(id);
  }
  return link;
}

export function clearNativeTrackLinks() {
  links.clear();
}
