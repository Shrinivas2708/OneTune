export function imageSizeScore(url: string): number {
  const dimensionMatch = url.match(/-(\d+)x(\d+)(?=\.\w+$)/);
  if (dimensionMatch) {
    const width = Number.parseInt(dimensionMatch[1] ?? "0", 10);
    const height = Number.parseInt(dimensionMatch[2] ?? "0", 10);
    return width * height;
  }

  if (url.includes("500x500")) return 500 * 500;
  if (url.includes("150x150")) return 150 * 150;
  return 0;
}

export function upgradeArtworkUrl(url: string): string {
  return url.replace(/-(\d+)x(\d+)(?=\.\w+$)/, (_match, width, height) => {
    const size = Math.max(Number.parseInt(width, 10), Number.parseInt(height, 10));
    if (size >= 500) {
      return `-${width}x${height}`;
    }
    return "-500x500";
  });
}

export function pickBestImageUrl(
  images: Array<{ url: string }>,
): string | undefined {
  if (!images.length) return undefined;

  const best = [...images].sort(
    (left, right) => imageSizeScore(right.url) - imageSizeScore(left.url),
  )[0]?.url;

  return best ? upgradeArtworkUrl(best) : undefined;
}
