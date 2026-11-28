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
| Hero video frames | `assets-src/hero-video-frames/` | `node scripts/prepare-hero-frames.mjs` | automatic (`src/content/hero-frames.json`) |

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

The hero plays a frame sequence like a video as you scroll through it. Put the frames (JPEG/PNG/WebP, in filename order) in `assets-src/hero-video-frames/` and run `node scripts/prepare-hero-frames.mjs`: it writes `001.webp`, `002.webp`, … (max 1280 px wide) to `public/assets/hero/frames/` and records the count and size in `src/content/hero-frames.json`. The alt text is `heroSequence.alt` in `site.ts`.

The hero stays pinned until frame `heroSequence.releaseAt` (90); the remaining frames play while it scrolls away. Near-white in every frame is lifted to pure white.

Frames are drawn on a canvas with a multiply blend, so a white background takes on the page colour. Frame 1 loads first and is all that is shown with reduced motion; the rest load in order in the background. Code: `src/components/hero/Hero.tsx`.

## Careers form

The form on `/careers` (name, email, phone, "Tell us about you") posts straight to a Google Apps Script web app, which appends each submission as a row in a Google Sheet. No server is involved, so it works on static hosting.

1. Create a Google Sheet (for example "M13 Careers").
2. In the sheet: **Extensions → Apps Script**. Replace the editor contents with `google-apps-script/careers.gs` and save.
3. **Deploy → New deployment →** type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Deploy and allow the permissions it asks for.
4. Copy the **Web app URL** (ends in `/exec`) into `careersEndpoint` in `src/content/site.ts`, then rebuild and deploy the site.

Submissions land in an "Applications" tab (created automatically) with the columns Submitted at, Name, Email, Phone, About. If you edit the script later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same. Until `careersEndpoint` is set, the page shows the company email instead of the form.

## Known limitations

- Entrance reveals use CSS scroll-driven animations. Browsers without support show content immediately, without the fade.
- The copyright year is written at build time and corrected in the browser.
