"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { GalleryImage } from "@/content/site";

type Props = {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const pad = (n: number) => String(n).padStart(2, "0");

function Arrow({ dir, onClick, className = "" }: { dir: "prev" | "next"; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous image" : "Next image"}
      className={`group grid size-12 place-items-center rounded-full border border-line-strong bg-paper/80 text-fg backdrop-blur-sm transition-[background-color,border-color,color,scale] duration-300 hover:border-olive hover:bg-olive hover:text-paper active:scale-95 md:size-14 ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={`size-5 transition-transform duration-300 ${
          dir === "prev" ? "group-hover:-translate-x-0.5" : "rotate-180 group-hover:translate-x-0.5"
        }`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}

export function Lightbox({ images, index, onIndexChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const image = images[index];
  const total = images.length;

  const go = (to: number, dir: 1 | -1) => {
    setDirection(dir);
    onIndexChange((to + total) % total);
  };
  const prev = () => go(index - 1, -1);
  const next = () => go(index + 1, 1);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const thumb = stripRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    thumb?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduced ? "auto" : "smooth" });
  }, [index]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowLeft" && total > 1) {
      event.preventDefault();
      prev();
    } else if (event.key === "ArrowRight" && total > 1) {
      event.preventDefault();
      next();
    } else if (event.key === "Home" && total > 1) {
      event.preventDefault();
      go(0, -1);
    } else if (event.key === "End" && total > 1) {
      event.preventDefault();
      go(total - 1, 1);
    } else if (event.key === "Tab") {
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? []);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || total < 2) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next();
      else prev();
    }
  };

  const neighbours = total > 1 ? [...new Set([(index + 1) % total, (index - 1 + total) % total])] : [];

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer, image ${index + 1} of ${total}`}
      onKeyDown={onKeyDown}
      className="lightbox-in fixed inset-0 z-[100] flex flex-col bg-paper/[0.97] backdrop-blur-md"
    >
      <div className="container-edge flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line">
        <p className="text-label tabular-nums text-muted" aria-live="polite">
          <span className="text-fg">{pad(index + 1)}</span>
          <span className="mx-2 text-muted/60">/</span>
          {pad(total)}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="text-label -mr-2 inline-flex items-center gap-3 p-2 text-fg hover:text-cyan-deep"
        >
          Close
          <span aria-hidden className="relative block h-3 w-3">
            <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-current" />
            <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-current" />
          </span>
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-4 py-5 md:px-28"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <figure
          key={image.src}
          className="lightbox-slide flex h-full max-w-full flex-col items-center justify-center"
          style={{ "--lb-dir": direction } as React.CSSProperties}
        >
          <Image
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt}
            sizes="(min-width: 768px) 80vw, 100vw"
            preload
            draggable={false}
            className="h-auto max-h-full w-auto max-w-full min-h-0 select-none object-contain shadow-[0_30px_70px_-35px_rgb(20_22_19/0.5)]"
          />
          {image.caption && (
            <figcaption className="mt-4 max-w-2xl shrink-0 text-center text-sm text-muted">{image.caption}</figcaption>
          )}
        </figure>

        {neighbours.map((i) => (
          <Image
            key={images[i].src}
            src={images[i].src}
            width={images[i].width}
            height={images[i].height}
            alt=""
            aria-hidden
            sizes="(min-width: 768px) 80vw, 100vw"
            loading="eager"
            className="pointer-events-none invisible absolute size-px"
          />
        ))}

        {total > 1 && (
          <>
            <Arrow dir="prev" onClick={prev} className="absolute top-1/2 left-6 hidden -translate-y-1/2 md:grid" />
            <Arrow dir="next" onClick={next} className="absolute top-1/2 right-6 hidden -translate-y-1/2 md:grid" />
          </>
        )}
      </div>

      {total > 1 && (
        <div className="shrink-0 border-t border-line">
          <div className="container-edge flex items-center gap-3 py-3 md:py-4">
            <Arrow dir="prev" onClick={prev} className="shrink-0 md:hidden" />
            <div
              ref={stripRef}
              role="group"
              aria-label="Choose an image"
              className="flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto overscroll-x-contain px-1 py-1 [scrollbar-width:none] md:justify-center-safe md:gap-3"
            >
              {images.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  data-index={i}
                  onClick={() => go(i, i < index ? -1 : 1)}
                  aria-label={`Show image ${i + 1} of ${total}: ${img.alt}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`relative size-14 shrink-0 snap-center overflow-hidden rounded-md bg-surface-2 transition-[opacity,scale,box-shadow] duration-300 md:size-16 ${
                    i === index
                      ? "scale-100 opacity-100 ring-2 ring-olive ring-offset-2 ring-offset-paper"
                      : "scale-95 opacity-55 hover:scale-100 hover:opacity-100"
                  }`}
                >
                  <Image src={img.thumb?.src ?? img.src} alt="" fill sizes="64px" loading="lazy" className="object-cover" />
                </button>
              ))}
            </div>
            <Arrow dir="next" onClick={next} className="shrink-0 md:hidden" />
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
