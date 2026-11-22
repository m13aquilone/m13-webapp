"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { GalleryImage } from "@/content/site";

import { Lightbox } from "./Lightbox";

const ALL = "All";

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const categories = useMemo(() => {
    const set = new Set(images.map((i) => i.category?.trim()).filter((c): c is string => !!c));
    return set.size >= 2 ? [ALL, ...set] : [];
  }, [images]);

  const [filter, setFilter] = useState(ALL);
  const [open, setOpen] = useState<number | null>(null);

  const visible = useMemo(
    () => (filter === ALL ? images : images.filter((i) => i.category?.trim() === filter)),
    [images, filter],
  );

  return (
    <>
      {categories.length > 0 && (
        <div role="group" aria-label="Filter images" className="mb-12 flex flex-wrap gap-x-8 gap-y-3 border-b border-line pb-5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className={`text-label py-2 transition-colors ${
                filter === c ? "text-bone underline decoration-olive underline-offset-[10px]" : "text-ash hover:text-bone"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ul className="columns-1 gap-6 sm:columns-2 lg:columns-3 lg:gap-8">
        {visible.map((image, i) => (
          <li key={image.src} className="mb-6 break-inside-avoid lg:mb-8">
            <figure>
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group block w-full overflow-hidden bg-graphite"
                aria-label={`Open image: ${image.alt}`}
              >
                <Image
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={image.alt}
                  sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
                  loading="lazy"
                  className="h-auto w-full transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.02]"
                />
              </button>
              {image.caption && <figcaption className="text-label mt-3 leading-relaxed text-ash">{image.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>

      {open !== null && visible[open] && (
        <Lightbox images={visible} index={open} onIndexChange={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}
