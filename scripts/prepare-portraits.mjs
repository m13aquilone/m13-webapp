/**
 * Crops transparent portrait cut-outs to a square that sits on the subject's
 * lowest visible edge, so photos fill their frame without empty margins.
 *
 *   node scripts/prepare-portraits.mjs
 *
 * Reads every PNG in public/assets/visionaries and writes the result to
 * public/assets/visionaries/web/. Originals are never modified.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "public", "assets", "visionaries");
const OUT = path.join(DIR, "web");
const SIZE = 1000;
const HEAD_ROOM = 0.04;

fs.mkdirSync(OUT, { recursive: true });

for (const file of fs.readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".png"))) {
  const src = path.join(DIR, file);
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  let minX = width, minY = height, maxX = -1, maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) continue;

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;
  const side = Math.min(Math.max(contentW, 1), Math.max(contentH * (1 + HEAD_ROOM), 1), width, height);
  const finalSide = Math.round(Math.max(side, Math.min(contentH * (1 + HEAD_ROOM), width, height)));

  const centerX = (minX + maxX) / 2;
  const left = Math.round(Math.min(Math.max(0, centerX - finalSide / 2), width - finalSide));
  const top = Math.round(Math.min(Math.max(0, maxY + 1 - finalSide), height - finalSide));

  const outFile = path.join(OUT, file);
  await sharp(src)
    .extract({ left, top, width: finalSide, height: finalSide })
    .resize(SIZE, SIZE)
    .png({ compressionLevel: 9 })
    .toFile(outFile);
  console.log(`${file}: content ${contentW}x${contentH}, crop ${finalSide} at ${left},${top}`);
}
