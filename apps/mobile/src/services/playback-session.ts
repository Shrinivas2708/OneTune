let generation = 0;
let queueAdvanceSuppressed = 0;

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

export function isQueueAdvanceSuppressed(): boolean {
  return queueAdvanceSuppressed > 0;
}

export async function withQueueAdvanceSuppressed<T>(
  operation: () => Promise<T>,
): Promise<T> {
  queueAdvanceSuppressed += 1;
  try {
    return await operation();
  } finally {
    queueAdvanceSuppressed -= 1;
  }
}
