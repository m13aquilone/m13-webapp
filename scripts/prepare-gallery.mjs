/**
 * Turns every photo dropped into `assets-src/gallery/` into a web-ready WebP
 * (plus a small thumbnail) in `public/assets/gallery/` and rewrites
 * `src/content/gallery.json`, which the site reads. Run it after adding or removing photos:
 *
 *   npm run gallery
 *
 * - Photos are rotated upright, resized to 2560 px on the long edge and sorted
 *   newest first by capture date (EXIF, then the date in the file name, then
 *   the file's modified time).
 * - Alt text, captions and categories edited in `gallery.json` are kept, keyed
 *   by the original file name. New photos get a generic alt text; replace it
 *   with a description of what the photo shows.
 * - Unchanged photos are skipped; web files whose original was removed are
 *   deleted.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "assets-src/gallery");
const OUT_DIR = path.join(ROOT, "public/assets/gallery");
const THUMB_DIR = path.join(OUT_DIR, "thumbs");
const MANIFEST = path.join(ROOT, "src/content/gallery.json");
const LONG_EDGE = 2560;
/** Grid tiles and the lightbox strip; large grid tiles are at most ~840 CSS px wide. */
const THUMB_EDGE = 1000;
const DEFAULT_ALT = "Photo from M13 Aquilone";
const INPUT = /\.(jpe?g|png|webp|avif|tiff?)$/i;

const slug = (file) => {
  let base = file;
  while (INPUT.test(base)) base = base.replace(INPUT, "");
  return base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

function captureTime(meta, file, stat) {
  const exif = meta.exif?.toString("latin1").match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (exif) {
    const [, y, mo, d, h, mi, s] = exif.map(Number);
    return Date.UTC(y, mo - 1, d, h, mi, s);
  }
  const named = file.match(/(20\d{2})(\d{2})(\d{2})(?:[_-]?(\d{2})(\d{2})(\d{2}))?/);
  if (named) {
    const [, y, mo, d, h = 0, mi = 0, s = 0] = named.map((v) => (v === undefined ? undefined : Number(v)));
    return Date.UTC(y, mo - 1, d, h, mi, s);
  }
  return stat.mtimeMs;
}

const previous = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : [];
const byFile = new Map(previous.map((entry) => [entry.file, entry]));
fs.mkdirSync(THUMB_DIR, { recursive: true });

const sources = fs.readdirSync(SRC_DIR).filter((f) => INPUT.test(f) && !f.startsWith("."));
const entries = [];

for (const file of sources) {
  const input = path.join(SRC_DIR, file);
  const stat = fs.statSync(input);
  const outName = `${slug(file)}.webp`;
  const output = path.join(OUT_DIR, outName);
  const thumbOut = path.join(THUMB_DIR, outName);
  const meta = await sharp(input).metadata();

  if (!fs.existsSync(output) || fs.statSync(output).mtimeMs < stat.mtimeMs) {
    await sharp(input)
      .rotate()
      .resize(LONG_EDGE, LONG_EDGE, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(output);
    console.log(`gallery/${outName}`);
  }
  if (!fs.existsSync(thumbOut) || fs.statSync(thumbOut).mtimeMs < stat.mtimeMs) {
    await sharp(input)
      .rotate()
      .resize(THUMB_EDGE, THUMB_EDGE, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(thumbOut);
  }
  const { width, height } = await sharp(output).metadata();
  const thumbMeta = await sharp(thumbOut).metadata();
  const kept = byFile.get(file) ?? {};
  entries.push({
    file,
    src: `/assets/gallery/${outName}`,
    width,
    height,
    thumb: { src: `/assets/gallery/thumbs/${outName}`, width: thumbMeta.width, height: thumbMeta.height },
    alt: kept.alt?.trim() ? kept.alt : DEFAULT_ALT,
    ...(kept.caption ? { caption: kept.caption } : {}),
    ...(kept.category ? { category: kept.category } : {}),
    takenAt: new Date(captureTime(meta, file, stat)).toISOString(),
  });
}

entries.sort((a, b) => b.takenAt.localeCompare(a.takenAt));

const live = new Set(entries.map((e) => path.basename(e.src)));
for (const dir of [OUT_DIR, THUMB_DIR]) {
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".webp") && !live.has(f)) {
      fs.rmSync(path.join(dir, f));
      console.log(`removed ${path.relative(ROOT, path.join(dir, f))}`);
    }
  }
}

fs.writeFileSync(MANIFEST, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`${entries.length} photos in src/content/gallery.json`);
