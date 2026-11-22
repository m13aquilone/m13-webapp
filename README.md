# M13 Aquilone Pvt Ltd: website

Next.js 16 (App Router), TypeScript and Tailwind CSS 4.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm start
```

Pages: `/` (Home), `/gallery`, `/about`. The contact footer (`#contact`) appears on every page.

## Adding your assets

All content lives in **`src/content/site.ts`**. Put files under `public/assets/…` and reference them with paths that start with `/assets/…`.

Every image entry needs its real pixel `width` and `height`, which reserve space and prevent layout shift. Any entry whose file is missing is skipped automatically, so an unfinished upload never shows a broken image or breaks the build.

| What | Folder | Config field | Notes |
| --- | --- | --- | --- |
| Company logo | `public/assets/brand/` | `logo` | `{ src, width, height, alt }`. Replaces the text wordmark in the header. |
| Partner logos | `public/assets/partners/` | `partners` | `{ name, logo: { src, width, height }, scale? }`. `name` is the accessible name. The "Partnering with" section stays hidden while this list is empty. |
| Business logos | `public/assets/verticals/` | `verticals[n].logo` | Keep the three names as they are. Add `href` only if a real destination exists; rows are not links otherwise. |
| Visionary photos | `public/assets/visionaries/` | `visionaries[n].photo` | Shown in a square frame. For transparent cut-outs, run `node scripts/prepare-portraits.mjs` to crop the empty margins, then point the config at the result in `web/`. |
| Gallery images | `public/assets/gallery/` | `gallery` | `{ src, width, height, alt, caption?, category? }`. `alt` must describe the photo. Captions show only if provided. Filters appear only when at least two distinct `category` values exist. The Home preview stays hidden while this list is empty. |

Example:

```ts
partners: [
  { name: "Partner Name", logo: { src: "/assets/partners/partner-name.svg", width: 240, height: 80 } },
  // Use scale to balance optical size, e.g. 0.85 for a heavy wordmark or 1.2 for a small emblem.
],
gallery: [
  { src: "/assets/gallery/lobby-01.jpg", width: 2400, height: 1600, alt: "Reception desk with timber panelling" },
],
```

### Phone and email

Set `company.phone` and `company.email` in `site.ts`. The rows (with working `tel:` and `mailto:` links) appear in the footer only when a value is set.

## Hero scroll sequence

`heroFrames` in `site.ts` lists the images, in order, and `heroTransition` picks how one becomes the next as you scroll:

| Value | Effect |
| --- | --- |
| `"liquid"` (default) | The photo ripples and melts upward into the next through flowing noise, with slight colour fringing and a thin cyan edge. WebGL shader in `liquid.ts`; falls back to a crossfade without WebGL. |
| `"prism"` | The photo is cut into vertical slats that turn in 3D, one after another, to reveal the next. CSS 3D only. |
| `"particles"` | The photo dissolves into glowing dust that swirls and re-forms as the next. Best for objects on a black background (`morph.ts`). |

At rest the hero always shows the normal, sharp image; the effect only runs during transitions, and only while the hero is on screen. Between transitions the image tilts gently with the pointer. With reduced motion, only the first image is shown. Code: `src/components/hero/`.

The originals live in `public/assets/hero/*.jpg`; the site loads 4:3 WebP versions (1920 × 1440, quality 90, light edge vignette) generated from them: `gym-rack.webp`, `cafe-bowl.webp` and `yoga.webp`. The hero is served at quality 90 (`images.qualities` in `next.config.ts`).

When replacing an image, use a new file name: the Next.js image cache keys on the URL.

## Logos

Run `node scripts/prepare-logos.mjs` to make supplied logos work on the black background: it removes white or dark backgrounds, turns black ink off-white, keeps coloured accents and trims margins. Output goes to a `web/` folder beside each original; edit the list at the top of the script for new files.

## Known limitations

- Entrance reveals use CSS scroll-driven animations. Browsers without support show content immediately, without the fade.
