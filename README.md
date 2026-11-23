# M13 Aquilone Pvt Ltd: website

Next.js 16 (App Router), TypeScript and Tailwind CSS 4, exported as a fully static site for Cloudflare Pages.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build    # static site in ./out
npm run preview  # serve ./out locally
```

Pages: `/` (Home), `/gallery`, `/about`, plus a `404` page. The contact footer (`#contact`) appears on every page.

## Deploying to Cloudflare Pages

`next.config.ts` sets `output: "export"`, so `npm run build` writes plain HTML, CSS, JS and images to `out/`. There is no server: Next.js image optimisation is off (`images.unoptimized`), so every image is pre-sized by the scripts below.

**Git integration** (Cloudflare dashboard, Workers & Pages, Create, Pages, Connect to Git):

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `out` |
| Environment variable | `NEXT_PUBLIC_SITE_URL` = the live URL, e.g. `https://m13aquilone.com` (used for social-share metadata) |

Node 22 is picked up from `.node-version`.

**From your machine:** `npm run deploy` builds and uploads with Wrangler (`wrangler.jsonc`); the first run asks you to log in.

`public/_headers` sets long-lived caching for `/_next/static/*` (fingerprinted) and one week for `/assets/*`. Because assets are cached, give a replaced image a new file name.

Cloudflare rejects files over 25 MB, and everything in `public/` is deployed, so originals never go in `public/`: they live in `assets-src/`, and the scripts write web-sized copies into `public/assets/`.

## Adding your assets

All content lives in **`src/content/site.ts`**; image paths start with `/assets/…` (files in `public/assets/`). Every image entry needs its real pixel `width` and `height`, which reserve space and prevent layout shift. Any entry whose file is missing is skipped automatically.

| What | Original goes in | Then run | Config field |
| --- | --- | --- | --- |
| Gallery photos | `assets-src/gallery/` | `npm run gallery` | automatic (`src/content/gallery.json`) |
| Business and partner logos | `assets-src/brand/`, `assets-src/partners/` | `node scripts/prepare-logos.mjs` | `verticals[n].logo`, `partners` |
| Visionary photos (transparent PNG) | `assets-src/visionaries/` | `node scripts/prepare-portraits.mjs` | `visionaries[n].photo` |
| Hero images | `assets-src/hero/` | `node scripts/prepare-hero.mjs` | `heroFrames` |

### Gallery

Drop photos (any size, JPEG/PNG/WebP) into `assets-src/gallery/` and run `npm run gallery`. It rotates them upright, writes a 2560 px WebP and a 1000 px thumbnail to `public/assets/gallery/`, and rewrites `src/content/gallery.json`, newest photo first. Removed originals are removed from the site too.

New photos get a generic alt text, "Photo from M13 Aquilone". Replace `alt` in `gallery.json` with what the photo shows; you can also add `caption` and `category` (filters appear once two categories exist). The script keeps these edits.

The gallery shows 18 photos per page with numbered pagination. Clicking a photo opens a viewer with arrows, keyboard (arrow keys, Home, End, Escape), swipe on touch screens and a thumbnail strip; it moves through every photo, not just the current page.

### Logos

`scripts/prepare-logos.mjs` removes white or dark backgrounds, turns light neutral ink near-black for the light theme, keeps coloured accents, trims margins and writes a WebP (max 1200 px wide) to `public/assets/brand/` or `public/assets/partners/`. Add new files to the list at the top of the script, then add the printed size to `site.ts`.

### Phone and email

Set `company.phone` and `company.email` in `site.ts`. The rows (with working `tel:` and `mailto:` links) appear in the footer only when a value is set.

## Theme

Light theme with military green and cyan accents; colours are `@theme` tokens in `src/app/globals.css` (`paper`, `fg`, `olive`, `cyan`, …). Add `theme-olive` to a section to turn it into a solid green band (used by the footer and the About mission), `wash-cyan` or `wash-olive` for a tinted gradient that fades to the page colour, and `text-gradient` for green-to-cyan lettering.

## Hero scroll sequence

`heroFrames` in `site.ts` lists the images, in order; each `caption` (Strength, Nourish, Restore) shows next to the step counter in the hero's bottom rail. `heroTransition` picks how one image becomes the next as you scroll:

| Value | Effect |
| --- | --- |
| `"liquid"` (default) | The image ripples and melts upward into the next through flowing noise, with slight colour fringing and a thin cyan edge. WebGL shader in `liquid.ts`; falls back to a crossfade without WebGL. |
| `"prism"` | The image is cut into vertical slats that turn in 3D, one after another, to reveal the next. CSS 3D only. |
| `"particles"` | The image dissolves into glowing dust that re-forms as the next. Designed for dark backgrounds; it does not show on the light theme. |

The hero images are cut-outs on a transparent background, so they sit directly on the page. `scripts/prepare-hero.mjs` crops each source in `assets-src/hero/` to 4:3 at 1920 × 1440 and removes its light studio background. With reduced motion, only the first image is shown. Code: `src/components/hero/`.

## Known limitations

- Entrance reveals use CSS scroll-driven animations. Browsers without support show content immediately, without the fade.
- The copyright year is written at build time and corrected in the browser.
