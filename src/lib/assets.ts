import "server-only";

import fs from "node:fs";
import path from "node:path";

import {
  site,
  type GalleryImage,
  type ImageAsset,
  type Partner,
  type Vertical,
  type Visionary,
} from "@/content/site";

const publicDir = path.join(process.cwd(), "public");

export function publicFileExists(src: string | undefined): src is string {
  if (!src || !src.startsWith("/")) return false;
  const resolved = path.normalize(path.join(publicDir, src));
  if (!resolved.startsWith(publicDir)) return false;
  try {
    return fs.statSync(resolved).isFile();
  } catch {
    return false;
  }
}

function existing<T extends ImageAsset>(asset: T | undefined): T | undefined {
  return asset && publicFileExists(asset.src) ? asset : undefined;
}

export function getLogo() {
  return existing(site.logo);
}

export function getPartners(): Partner[] {
  return site.partners.filter((p) => publicFileExists(p.logo.src));
}

export function getVerticals(): Vertical[] {
  return site.verticals.map((v) => ({ ...v, logo: existing(v.logo) }));
}

export function getVisionaries(): Visionary[] {
  return site.visionaries.map((v) => ({ ...v, photo: existing(v.photo) }));
}

export function getGallery(): GalleryImage[] {
  return site.gallery.filter((img) => publicFileExists(img.src) && img.alt.trim().length > 0);
}

export function getHeroFrames() {
  return site.heroFrames.filter((f) => publicFileExists(f.src));
}
