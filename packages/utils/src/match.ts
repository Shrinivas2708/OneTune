import type { ProviderId, SearchResult } from "@vibevault/types";
import { normalizeTrackKey } from "./strings";

const PLAYABLE_PROVIDER_IDS = new Set<ProviderId>(["jiosaavn", "youtube"]);

export interface TrackMatchHint {
  title: string;
  artists: { name: string }[];
  durationMs?: number | null;
}

export function isPlayableProvider(providerId: ProviderId | string): boolean {
  return PLAYABLE_PROVIDER_IDS.has(providerId as ProviderId);
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

export function pickBestPlayableMatch(
  candidates: SearchResult[],
  hint: TrackMatchHint,
): SearchResult | null {
  const playable = candidates.filter((candidate) =>
    isPlayableProvider(candidate.providerId),
  );

  if (playable.length === 0) {
    return null;
  }

  const hintKey = normalizeTrackKey(hint.title, hint.artists[0]?.name ?? "");
  const hintTokens = tokenize(
    `${hint.title} ${hint.artists.map((artist) => artist.name).join(" ")}`,
  );

  let best: SearchResult | null = null;
  let bestScore = -1;

  for (const candidate of playable) {
    let score = 0;
    const candidateKey = normalizeTrackKey(
      candidate.title,
      candidate.artists[0]?.name ?? "",
    );

    if (candidateKey === hintKey) {
      score += 1;
    }

    const candidateTokens = tokenize(
      `${candidate.title} ${candidate.artists.map((artist) => artist.name).join(" ")}`,
    );
    const overlap = hintTokens.filter((token) =>
      candidateTokens.includes(token),
    ).length;
    score += (overlap / Math.max(hintTokens.length, 1)) * 0.6;

    if (hint.durationMs && candidate.durationMs) {
      const diff = Math.abs(hint.durationMs - candidate.durationMs);
      if (diff < 5_000) score += 0.25;
      else if (diff < 15_000) score += 0.1;
    }

    if (candidate.providerId === "jiosaavn") {
      score += 0.1;
    }

    score += (candidate.relevanceScore ?? 0) * 0.2;

    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  if (bestScore < 0.35) {
    return null;
  }

  return best;
}
