import Image from "next/image";
import Link from "next/link";

import type { GalleryImage } from "@/content/site";
import { SectionHeading } from "@/components/ui/SectionHeading";

function Figure({ image, sizes }: { image: GalleryImage; sizes: string }) {
  return (
    <figure data-reveal>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={image.alt}
        sizes={sizes}
        loading="lazy"
        className="h-auto w-full bg-surface-2"
      />
      {image.caption && <figcaption className="text-label mt-3 text-muted">{image.caption}</figcaption>}
    </figure>
  );
}

/** Hidden entirely until gallery images are configured. */
export function GalleryPreview({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;
  const picks = images.slice(0, 5);
  const left = picks.filter((_, i) => i % 2 === 0);
  const right = picks.filter((_, i) => i % 2 === 1);

  return (
    <section aria-labelledby="gallery-preview-heading" className="wash-olive border-t border-line py-24 md:py-40">
      <div className="container-edge">
        <SectionHeading
          id="gallery-preview-heading"
          aside={
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-3 text-fg"
            >
              View gallery
              <span aria-hidden className="h-px w-8 bg-olive transition-all duration-500 ease-out-expo group-hover:w-12 group-hover:bg-cyan" />
            </Link>
          }
        >
          Gallery
        </SectionHeading>

        <div className="mt-14 grid gap-8 md:mt-20 md:grid-cols-12 md:gap-10">
          <div className="flex flex-col gap-8 md:col-span-7 md:gap-10">
            {left.map((img) => (
              <Figure key={img.src} image={img} sizes="(min-width: 768px) 56vw, 100vw" />
            ))}
          </div>
          {right.length > 0 && (
            <div className="flex flex-col gap-8 md:col-span-4 md:col-start-9 md:mt-40 md:gap-10">
              {right.map((img) => (
                <Figure key={img.src} image={img} sizes="(min-width: 768px) 32vw, 100vw" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
