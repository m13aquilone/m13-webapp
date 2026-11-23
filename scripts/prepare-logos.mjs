/**
 * Prepares supplied logos for the light site background.
 *
 *   node scripts/prepare-logos.mjs
 *
 * For each entry below it removes a solid white or dark background
 * (colour-to-alpha, so anti-aliased edges stay smooth), optionally recolours
 * neutral (grey/white/black) ink while keeping coloured accents untouched,
 * trims empty margins, and writes a WebP (max 1200 px wide) to
 * `public/assets/<folder>/`. Originals live in `assets-src/` and are never
 * modified.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PROJECT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SRC = path.join(PROJECT, "assets-src");
const OUT = path.join(PROJECT, "public", "assets");
const INK = [20, 22, 19];
const BONE = [244, 244, 239];

/**
 * background: "white" | "dark" | "none".
 * recolor: "dark" turns light neutral ink (white lettering) into the site's near-black;
 *          "light" turns dark neutral ink into off-white (for dark backgrounds).
 */
const JOBS = [
  { file: "brand/m13aquilone.png", background: "white" },
  { file: "brand/haffee.png", background: "white" },
  { file: "brand/aquilone.png", background: "white" },
  { file: "partners/cult.webp", background: "none", recolor: "dark" },
  { file: "partners/essenso.webp", background: "dark", recolor: "dark" },
  { file: "partners/hammer-strength-logo-png_seeklogo-305649.png", background: "white" },
  { file: "partners/life.jpeg", background: "white" },
];

async function processLogo({ file, background, recolor }) {
  const src = path.join(SRC, file);
  if (!fs.existsSync(src)) {
    console.warn(`skip (missing): ${file}`);
    return;
  }
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const px = new Uint8ClampedArray(data.buffer, data.byteOffset, data.length);

  const bg = [px[0], px[1], px[2]];
  let minX = width, minY = height, maxX = -1, maxY = -1;

  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    let [r, g, b] = [px[o], px[o + 1], px[o + 2]];
    let a = px[o + 3] / 255;

    if (background === "white") {
      const alpha = Math.max(255 - r, 255 - g, 255 - b) / 255;
      if (alpha < 0.05) {
        a = 0;
      } else {
        r = 255 - (255 - r) / alpha;
        g = 255 - (255 - g) / alpha;
        b = 255 - (255 - b) / alpha;
        a *= alpha;
      }
    } else if (background === "dark") {
      const alpha = Math.max(
        (r - bg[0]) / (255 - bg[0] || 1),
        (g - bg[1]) / (255 - bg[1] || 1),
        (b - bg[2]) / (255 - bg[2] || 1),
      );
      if (alpha < 0.05) {
        a = 0;
      } else {
        r = bg[0] + (r - bg[0]) / alpha;
        g = bg[1] + (g - bg[1]) / alpha;
        b = bg[2] + (b - bg[2]) / alpha;
        a *= Math.min(1, alpha);
      }
    }

    if (recolor && a > 0) {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (recolor === "light" && max - min < 48 && max < 150) [r, g, b] = BONE;
      if (recolor === "dark" && max - min < 40 && min > 110) [r, g, b] = INK;
    }

    px[o] = r;
    px[o + 1] = g;
    px[o + 2] = b;
    px[o + 3] = Math.round(a * 255);

    if (px[o + 3] > 10) {
      const x = i % width;
      const y = (i / width) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0) {
    console.warn(`skip (empty after processing): ${file}`);
    return;
  }
  const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02);
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const cropW = Math.min(width - left, maxX - minX + 1 + pad * 2);
  const cropH = Math.min(height - top, maxY - minY + 1 + pad * 2);

  const outDir = path.join(OUT, path.dirname(file));
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${path.parse(file).name}.webp`);
  const result = await sharp(Buffer.from(px.buffer, px.byteOffset, px.length), { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: cropW, height: cropH })
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(outFile);
  console.log(`${path.relative(OUT, outFile)}  ${result.width}x${result.height}`);
}

for (const job of JOBS) await processLogo(job);
