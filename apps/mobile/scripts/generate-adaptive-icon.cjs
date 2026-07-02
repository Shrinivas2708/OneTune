/**
 * Builds a padded Android adaptive-icon foreground from logo.png.
 * Android masks icons to a circle — content should sit in the center ~66% safe zone.
 */
const path = require("path");
const Jimp = require("jimp-compact");

const SIZE = 1024;
/** Smaller = more padding on the home screen (Kick-like). */
const SCALE = 0.56;

async function main() {
  const root = path.join(__dirname, "..");
  const logoPath = path.join(root, "assets", "logo.png");
  const outPath = path.join(root, "assets", "adaptive-icon.png");

  const logo = await Jimp.read(logoPath);
  const target = Math.round(SIZE * SCALE);
  logo.scaleToFit(target, target);

  const canvas = new Jimp(SIZE, SIZE, 0x000000ff);
  const x = Math.round((SIZE - logo.bitmap.width) / 2);
  const y = Math.round((SIZE - logo.bitmap.height) / 2);
  canvas.composite(logo, x, y);

  await canvas.writeAsync(outPath);
  console.log(`Wrote ${outPath} (logo scaled to ${SCALE * 100}% of ${SIZE}px)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
