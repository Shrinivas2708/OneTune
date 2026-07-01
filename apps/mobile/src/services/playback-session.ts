let generation = 0;

export function beginPlaybackTransition(): number {
  generation += 1;
  return generation;
}

export function isActivePlaybackGeneration(token: number): boolean {
  return token === generation;
}

export function getPlaybackGeneration(): number {
  return generation;
}
