/**
 * Builds the hero frames from `assets-src/hero/`: crops each source photo to 4:3 at 1920 × 1440 and
 * removes its light studio background, so the subject sits directly on the page.
 *
 * The background is found by flood-filling from the image border through light,
 * neutral pixels whose brightness changes smoothly, so white parts of the
 * subject (a shirt, a plate) that are separated by an edge are kept.
 *
 *   node scripts/prepare-hero.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const SRC = path.join(process.cwd(), "assets-src/hero");
const DIR = path.join(process.cwd(), "public/assets/hero");
const W = 1920;
const H = 1440;

const JOBS = [
  { src: "gym-white.zip", zipEntry: "11445777.png", out: "gym-cut.webp" },
  { src: "cafe-white.webp", out: "cafe-cut.webp", minLight: 232, step: 5 },
  { src: "yoga-white.jpg", out: "yoga-cut.webp", minLight: 196, step: 4 },
];

async function load(job) {
  if (!job.zipEntry) return sharp(path.join(SRC, job.src));
  const tmp = mkdtempSync(path.join(tmpdir(), "hero-"));
  execFileSync("unzip", ["-o", "-q", path.join(SRC, job.src), job.zipEntry, "-d", tmp]);
  const buf = await sharp(path.join(tmp, job.zipEntry)).toBuffer();
  rmSync(tmp, { recursive: true, force: true });
  return sharp(buf);
}

/** Returns an alpha mask (0 = background) for an RGB image with a light backdrop. */
function keyBackground(rgb, { minLight, step }) {
  const n = W * H;
  const lum = new Float32Array(n);
  const ok = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = rgb[i * 3];
    const g = rgb[i * 3 + 1];
    const b = rgb[i * 3 + 2];
    lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    ok[i] = Math.min(r, g, b) >= minLight && Math.max(r, g, b) - Math.min(r, g, b) < 18 ? 1 : 0;
  }
  const bg = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const push = (i) => {
    if (!bg[i] && ok[i]) {
      bg[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let x = 0; x < W; x++) {
    push(x);
    push((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    push(y * W);
    push(y * W + W - 1);
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % W;
    const y = (i / W) | 0;
    const near = [x > 0 && i - 1, x < W - 1 && i + 1, y > 0 && i - W, y < H - 1 && i + W];
    for (const j of near) {
      if (j !== false && !bg[j] && ok[j] && Math.abs(lum[j] - lum[i]) <= step) {
        bg[j] = 1;
        queue[tail++] = j;
      }
    }
  }
  const alpha = Buffer.alloc(n);
  for (let i = 0; i < n; i++) alpha[i] = bg[i] ? 0 : 255;
  return alpha;
}

for (const job of JOBS) {
  const img = (await load(job)).resize(W, H, { fit: "cover", position: "centre" });
  let out;
  if (job.zipEntry) {
    out = img.ensureAlpha();
  } else {
    const rgb = await img.clone().removeAlpha().raw().toBuffer();
    const mask = keyBackground(rgb, job);
    const soft = await sharp(mask, { raw: { width: W, height: H, channels: 1 } })
      .blur(1.2)
      .extractChannel(0)
      .raw()
      .toBuffer();
    out = sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).joinChannel(soft, {
      raw: { width: W, height: H, channels: 1 },
    });
  }
  await out.webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(path.join(DIR, job.out));
  console.log(`hero/${job.out}  ${W}x${H}`);
}
