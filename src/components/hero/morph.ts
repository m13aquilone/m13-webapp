/**
 * Particle morph between hero images. Each image is sampled into a cloud of
 * coloured points (brighter pixels are picked more often, so pure black
 * backgrounds contribute nothing). A transition flies every point of one
 * cloud to a point of the next along a 3D burst, projected with perspective.
 */

export type Cloud = {
  /** Normalised to the image box: -0.5..0.5 on both axes. */
  x: Float32Array;
  y: Float32Array;
  rgb: Uint8ClampedArray;
};

export type Transition = {
  count: number;
  ax: Float32Array;
  ay: Float32Array;
  bx: Float32Array;
  by: Float32Array;
  aRgb: Uint8ClampedArray;
  bRgb: Uint8ClampedArray;
  delay: Float32Array;
  dx: Float32Array;
  dy: Float32Array;
  dz: Float32Array;
};

export type Box = { cx: number; cy: number; w: number; h: number };

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SAMPLE_WIDTH = 240;
const MIN_LUMA = 34;

export function sampleImage(img: HTMLImageElement, count: number, seed: number): Cloud {
  const w = SAMPLE_WIDTH;
  const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;

  const idx: number[] = [];
  const cum: number[] = [];
  let total = 0;
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    const luma = Math.max(data[o], data[o + 1], data[o + 2]);
    if (luma < MIN_LUMA) continue;
    total += Math.pow(luma / 255, 1.6);
    idx.push(i);
    cum.push(total);
  }

  const rand = mulberry32(seed);
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  const rgb = new Uint8ClampedArray(count * 3);
  for (let n = 0; n < count; n++) {
    const target = rand() * total;
    let lo = 0;
    let hi = cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const p = idx[lo] ?? 0;
    const px = p % w;
    const py = (p / w) | 0;
    x[n] = (px + rand()) / w - 0.5;
    y[n] = (py + rand()) / h - 0.5;
    const o = p * 4;
    rgb[n * 3] = data[o];
    rgb[n * 3 + 1] = data[o + 1];
    rgb[n * 3 + 2] = data[o + 2];
  }
  return { x, y, rgb };
}

/** Pairs points by vertical rank (with jitter) so the morph flows rather than scrambles. */
export function buildTransition(a: Cloud, b: Cloud, seed: number): Transition {
  const count = Math.min(a.x.length, b.x.length);
  const rand = mulberry32(seed);
  const order = (c: Cloud) =>
    Array.from({ length: count }, (_, i) => i)
      .map((i) => ({ i, k: c.y[i] + (rand() - 0.5) * 0.35 }))
      .sort((p, q) => p.k - q.k)
      .map((p) => p.i);
  const oa = order(a);
  const ob = order(b);

  const t: Transition = {
    count,
    ax: new Float32Array(count),
    ay: new Float32Array(count),
    bx: new Float32Array(count),
    by: new Float32Array(count),
    aRgb: new Uint8ClampedArray(count * 3),
    bRgb: new Uint8ClampedArray(count * 3),
    delay: new Float32Array(count),
    dx: new Float32Array(count),
    dy: new Float32Array(count),
    dz: new Float32Array(count),
  };
  for (let n = 0; n < count; n++) {
    const i = oa[n];
    const j = ob[n];
    t.ax[n] = a.x[i];
    t.ay[n] = a.y[i];
    t.bx[n] = b.x[j];
    t.by[n] = b.y[j];
    t.aRgb.set(a.rgb.subarray(i * 3, i * 3 + 3), n * 3);
    t.bRgb.set(b.rgb.subarray(j * 3, j * 3 + 3), n * 3);
    t.delay[n] = 0.5 - a.y[i] + (rand() - 0.5) * 0.3;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = 0.25 + Math.pow(rand(), 1.6) * 0.75;
    t.dx[n] = Math.sin(phi) * Math.cos(theta) * r;
    t.dy[n] = Math.sin(phi) * Math.sin(theta) * r * 0.7;
    t.dz[n] = Math.cos(phi) * r;
  }
  return t;
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smoothstep = (a: number, b: number, v: number) => {
  const x = clamp01((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * Draws one frame of a transition at progress t (0..1). `box` is the image's
 * on-screen rectangle in canvas pixels; `size` is the base dot size in pixels.
 */
export function drawTransition(
  ctx: CanvasRenderingContext2D,
  tr: Transition,
  t: number,
  box: Box,
  size: number,
) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  const envelope = smoothstep(0, 0.12, t) * (1 - smoothstep(0.88, 1, t));
  if (envelope <= 0.001) return;

  ctx.globalCompositeOperation = "lighter";
  const spread = box.w * 0.36;
  const focal = box.w * 1.6;
  const swing = Math.sin(Math.PI * easeInOutCubic(t)) * 0.85;
  const cos = Math.cos(swing);
  const sin = Math.sin(swing);

  for (let n = 0; n < tr.count; n++) {
    const local = clamp01((t - tr.delay[n] * 0.28) / 0.72);
    const e = easeInOutCubic(local);
    const bump = Math.sin(Math.PI * e);

    const x = (tr.ax[n] + (tr.bx[n] - tr.ax[n]) * e) * box.w + tr.dx[n] * bump * spread;
    const y = (tr.ay[n] + (tr.by[n] - tr.ay[n]) * e) * box.h + tr.dy[n] * bump * spread;
    const z = tr.dz[n] * bump * spread * 1.4;

    const xr = x * cos - z * sin;
    const zr = x * sin + z * cos;
    const s = focal / Math.max(focal * 0.25, focal + zr);
    const dot = size * s * (1 + bump * 0.9);

    const o = n * 3;
    const r = tr.aRgb[o] + (tr.bRgb[o] - tr.aRgb[o]) * e;
    const g = tr.aRgb[o + 1] + (tr.bRgb[o + 1] - tr.aRgb[o + 1]) * e;
    const b = tr.aRgb[o + 2] + (tr.bRgb[o + 2] - tr.aRgb[o + 2]) * e;
    ctx.globalAlpha = envelope * (0.55 + 0.45 * bump) * Math.min(1, s);
    ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
    ctx.fillRect(box.cx + xr * s - dot / 2, box.cy + y * s - dot / 2, dot, dot);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

/** Maps overall scroll progress onto "hold frame i" or "transition i → i+1 at t". */
export function segmentAt(progress: number, frames: number) {
  const transitions = frames - 1;
  if (transitions <= 0) return { from: 0, to: 0, t: 0 };
  const HOLD = 1;
  const MOVE = 1.8;
  const total = frames * HOLD + transitions * MOVE;
  let u = clamp01(progress) * total;
  for (let i = 0; i < frames; i++) {
    if (u <= HOLD) return { from: i, to: i, t: 0 };
    u -= HOLD;
    if (i < transitions) {
      if (u <= MOVE) return { from: i, to: i + 1, t: u / MOVE };
      u -= MOVE;
    }
  }
  return { from: frames - 1, to: frames - 1, t: 0 };
}
