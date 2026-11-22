import type { Metadata } from "next";

import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { site } from "@/content/site";
import { getGallery } from "@/lib/assets";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Gallery of ${site.company.displayName}.`,
};

export default function GalleryPage() {
  const images = getGallery();

  return (
    <section aria-labelledby="gallery-heading" className="pb-24 pt-36 md:pb-40 md:pt-48">
      <div className="container-edge">
        <div className="flex items-end justify-between gap-6 border-b border-line pb-10 md:pb-14">
          <h1 id="gallery-heading" data-reveal className="wdth-expanded text-display font-[760] text-bone">
            Gallery
          </h1>
          {images.length > 0 && (
            <p className="text-label shrink-0 pb-3 text-ash">({String(images.length).padStart(2, "0")})</p>
          )}
        </div>

        <div className="mt-14 md:mt-20">
          {images.length > 0 ? (
            <GalleryGrid images={images} />
          ) : (
            <div data-reveal className="grid gap-10 md:grid-cols-12 md:gap-8">
              <div
                aria-hidden
                className="relative aspect-[4/3] overflow-hidden bg-graphite md:col-span-7"
              >
                <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_30%_100%,rgb(75_83_32/0.45),transparent_70%)]" />
                <div className="absolute inset-4 border border-line md:inset-6" />
                <div className="absolute inset-x-4 top-1/2 h-px bg-line md:inset-x-6" />
                <div className="absolute inset-y-4 left-[38%] w-px bg-line md:inset-y-6" />
              </div>
              <div className="flex flex-col justify-end md:col-span-4 md:col-start-9">
                <span aria-hidden className="block h-px w-10 bg-olive" />
                <p className="mt-6 font-serif text-[clamp(2.25rem,4.2vw,4rem)] italic leading-[1.02] tracking-[-0.02em] text-bone">
                  Our gallery is being curated.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
