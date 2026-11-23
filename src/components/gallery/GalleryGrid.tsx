"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

import type { GalleryImage } from "@/content/site";

import { Lightbox } from "./Lightbox";

const ALL = "All";
/** 18 tiles with two large ones fill 24 cells: whole rows at 4, 3 and 2 columns. */
const PAGE = 18;
const isLarge = (i: number) => i % 9 === 0;

/** Page numbers to show, with null marking a gap: 1 … 4 5 6 … 9. */
function pageList(current: number, count: number): (number | null)[] {
  const keep = new Set([0, count - 1, current - 1, current, current + 1]);
  const out: (number | null)[] = [];
  for (let p = 0; p < count; p++) {
    if (keep.has(p)) out.push(p);
    else if (out[out.length - 1] !== null) out.push(null);
  }
  return out;
}

function PageButton({ onClick, disabled, label, children }: { onClick: () => void; disabled?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="text-label inline-flex h-11 items-center gap-3 rounded-full border border-line-strong px-5 text-fg transition-colors duration-300 hover:border-olive hover:bg-olive hover:text-paper disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const categories = useMemo(() => {
    const set = new Set(images.map((i) => i.category?.trim()).filter((c): c is string => !!c));
    return set.size >= 2 ? [ALL, ...set] : [];
  }, [images]);

  const [filter, setFilter] = useState(ALL);
  const [open, setOpen] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);

  const visible = useMemo(
    () => (filter === ALL ? images : images.filter((i) => i.category?.trim() === filter)),
    [images, filter],
  );
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE));
  const start = page * PAGE;
  const listed = visible.slice(start, start + PAGE);

  const goToPage = (p: number) => {
    setPage(p);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    topRef.current?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  };

  const close = () => {
    const last = open;
    setOpen(null);
    if (last === null) return;
    const target = Math.floor(last / PAGE);
    setPage(target);
    requestAnimationFrame(() => {
      const tile = tiles.current[last - target * PAGE];
      tile?.focus({ preventScroll: true });
      tile?.scrollIntoView({ block: "nearest" });
    });
  };

  return (
    <div ref={topRef} className="scroll-mt-28">
      {categories.length > 0 && (
        <div role="group" aria-label="Filter images" className="mb-12 flex flex-wrap gap-x-8 gap-y-3 border-b border-line pb-5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => {
                setFilter(c);
                setPage(0);
              }}
              className={`text-label py-2 transition-colors ${
                filter === c ? "text-fg underline decoration-olive underline-offset-[10px]" : "text-muted hover:text-fg"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ul className="grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {listed.map((image, i) => (
          <li key={image.src} className={isLarge(i) ? "col-span-2 row-span-2" : ""}>
            <figure className="h-full">
              <button
                ref={(el) => {
                  tiles.current[i] = el;
                }}
                type="button"
                onClick={() => setOpen(start + i)}
                className="group relative block aspect-[4/5] h-full w-full overflow-hidden rounded-lg bg-surface-2"
                aria-label={`Open image ${start + i + 1} of ${visible.length}: ${image.alt}`}
              >
                <Image
                  src={image.thumb?.src ?? image.src}
                  fill
                  alt={image.alt}
                  sizes={
                    isLarge(i)
                      ? "(min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw"
                      : "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  }
                  loading={i < 4 ? undefined : "lazy"}
                  preload={page === 0 && i === 0}
                  className="object-cover transition-[scale] duration-[1100ms] ease-smooth will-change-[scale] group-hover:scale-[1.05]"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-[rgb(20_22_19/0.55)] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                />
                <span
                  aria-hidden
                  className="text-label absolute bottom-4 left-4 flex translate-y-2 items-center gap-3 text-[#f4f4ef] opacity-0 transition-[opacity,translate] duration-500 ease-smooth group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                >
                  {String(start + i + 1).padStart(2, "0")}
                  <span className="h-px w-6 bg-cyan" />
                  View
                </span>
              </button>
              {image.caption && <figcaption className="text-label mt-3 leading-relaxed text-muted">{image.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <nav aria-label="Gallery pages" className="mt-14 flex flex-col items-center gap-6 md:mt-20">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <PageButton onClick={() => goToPage(page - 1)} disabled={page === 0} label="Previous page">
              <span aria-hidden className="h-px w-5 bg-current" />
              <span className="hidden sm:inline">Prev</span>
            </PageButton>
            {pageList(page, pageCount).map((p, k) =>
              p === null ? (
                <span key={`gap-${k}`} aria-hidden className="text-label w-6 text-center text-muted">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  aria-label={`Page ${p + 1}`}
                  aria-current={p === page ? "page" : undefined}
                  className={`text-label grid size-11 place-items-center rounded-full tabular-nums transition-colors duration-300 ${
                    p === page ? "bg-olive text-paper" : "text-fg hover:bg-olive-soft"
                  }`}
                >
                  {String(p + 1).padStart(2, "0")}
                </button>
              ),
            )}
            <PageButton onClick={() => goToPage(page + 1)} disabled={page === pageCount - 1} label="Next page">
              <span className="hidden sm:inline">Next</span>
              <span aria-hidden className="h-px w-5 bg-current" />
            </PageButton>
          </div>
          <p className="text-label text-muted tabular-nums" aria-live="polite">
            {start + 1}–{start + listed.length} of {visible.length}
          </p>
        </nav>
      )}

      {open !== null && visible[open] && (
        <Lightbox images={visible} index={open} onIndexChange={setOpen} onClose={close} />
      )}
    </div>
  );
}
