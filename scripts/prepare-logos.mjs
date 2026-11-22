/**
 * Prepares supplied logos (and trims transparent portrait cut-outs) for the
 * black site background.
 *
 *   node scripts/prepare-logos.mjs
 *
 * For each entry below it removes a solid white or dark background
 * (colour-to-alpha, so anti-aliased edges stay smooth), optionally turns
 * neutral black/dark-brown ink into the site's off-white (#F4F4EF) while
 * keeping coloured accents untouched, trims empty margins, and writes a PNG
 * to a `web/` folder next to the original. Originals are never modified.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "public", "assets");
const BONE = [244, 244, 239];

/** background: "white" | "dark" | "none"; reverse: recolour neutral dark ink to off-white. */
const JOBS = [
  { file: "brand/m13aquilone.png", background: "white", reverse: true },
  { file: "brand/haffee.png", background: "white", reverse: true },
  { file: "brand/aquilone.png", background: "white", reverse: true },
  { file: "partners/cult.webp", background: "none", reverse: false },
  { file: "partners/essenso.webp", background: "dark", reverse: false },
  { file: "partners/hammer-strength-logo-png_seeklogo-305649.png", background: "white", reverse: true },
  { file: "partners/life.jpeg", background: "white", reverse: false },
  { file: "visionaries/SACHULEKHA-M-S.png", background: "none", reverse: false },
  { file: "visionaries/LEKSHMY-MOHAN-S.png", background: "none", reverse: false },
  { file: "visionaries/HARIKRISHNAN-V.png", background: "none", reverse: false },
];

async function processLogo({ file, background, reverse }) {
  const src = path.join(ROOT, file);
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

    if (reverse && a > 0) {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max - min < 48 && max < 150) [r, g, b] = BONE;
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

  const outDir = path.join(path.dirname(src), "web");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${path.parse(file).name}.png`);
  const result = await sharp(Buffer.from(px.buffer, px.byteOffset, px.length), { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: cropW, height: cropH })
    .png({ compressionLevel: 9, palette: false })
    .toFile(outFile);
  console.log(`${path.relative(ROOT, outFile)}  ${result.width}x${result.height}`);
}

for (const job of JOBS) await processLogo(job);
