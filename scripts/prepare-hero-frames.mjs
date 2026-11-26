// Converts the hero video frames in assets-src/hero-video-frames/ (any image
// format, sorted by filename) to numbered WebPs in public/assets/hero/frames/
// and writes src/content/hero-frames.json with the count and size.
//
// Near-white is lifted to pure white so the multiply blend in the hero matches
// the page colour exactly.
// Usage: node scripts/prepare-hero-frames.mjs
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "assets-src/hero-video-frames";
const OUT = "public/assets/hero/frames";
const MANIFEST = "src/content/hero-frames.json";
const MAX_WIDTH = 1280;
/** Channel value at and above which a pixel becomes pure white. */
const WHITE_POINT = 244;

const isImage = (f) => /\.(jpe?g|png|webp|avif)$/i.test(f);
const files = (await fs.readdir(SRC))
  .filter(isImage)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (!files.length) throw new Error(`No frames in ${SRC}`);

const meta = await sharp(path.join(SRC, files[0])).metadata();
const W = Math.min(MAX_WIDTH, meta.width);
const H = Math.round((W * meta.height) / meta.width);

await fs.rm(OUT, { recursive: true, force: true });
await fs.mkdir(OUT, { recursive: true });

let bytes = 0;
for (const [i, file] of files.entries()) {
  const px = await sharp(path.join(SRC, file))
    .resize(W, H, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer();
  for (let k = 0; k < px.length; k++) px[k] = Math.min(255, Math.round((px[k] * 255) / WHITE_POINT));
  const info = await sharp(px, { raw: { width: W, height: H, channels: 3 } })
    .webp({ quality: 80 })
    .toFile(path.join(OUT, `${String(i + 1).padStart(3, "0")}.webp`));
  bytes += info.size;
}

await fs.writeFile(
  MANIFEST,
  `${JSON.stringify({ path: `/${path.relative("public", OUT)}`, count: files.length, width: W, height: H }, null, 2)}\n`,
);
console.log(`${files.length} frames, ${W}x${H}, ${(bytes / 1024 / 1024).toFixed(2)} MB → ${OUT}`);
