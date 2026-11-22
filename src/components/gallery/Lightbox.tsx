"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { GalleryImage } from "@/content/site";

type Props = {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

export function Lightbox({ images, index, onIndexChange, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const image = images[index];
  const total = images.length;

  const prev = () => onIndexChange((index - 1 + total) % total);
  const next = () => onIndexChange((index + 1) % total);

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
    } else if (event.key === "Tab") {
      const items = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [],
      );
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

  const counter = `${index + 1} / ${total}`;

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer, ${counter}`}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[100] flex flex-col bg-ink/[0.97]"
    >
      <div className="container-edge flex h-[4.5rem] shrink-0 items-center justify-between border-b border-line">
        <p className="text-label text-ash" aria-live="polite">
          {counter}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="text-label -mr-2 inline-flex items-center gap-3 p-2 text-bone hover:text-cyan"
        >
          Close
          <span aria-hidden className="relative block h-3 w-3">
            <span className="absolute left-0 top-1/2 h-px w-full rotate-45 bg-current" />
            <span className="absolute left-0 top-1/2 h-px w-full -rotate-45 bg-current" />
          </span>
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 py-6 md:px-24"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <figure className="flex max-h-full max-w-full flex-col items-center">
          <Image
            key={image.src}
            src={image.src}
            width={image.width}
            height={image.height}
            alt={image.alt}
            sizes="100vw"
            className="h-auto max-h-[calc(100dvh-15rem)] w-auto max-w-full object-contain"
          />
          {image.caption && (
            <figcaption className="mt-4 max-w-2xl text-center text-sm text-ash">{image.caption}</figcaption>
          )}
        </figure>
      </div>

      {total > 1 && (
        <div className="container-edge flex h-20 shrink-0 items-center justify-between border-t border-line">
          <button
            type="button"
            onClick={prev}
            className="text-label group inline-flex items-center gap-4 p-2 text-bone hover:text-cyan"
          >
            <span aria-hidden className="h-px w-8 bg-current transition-all group-hover:w-12" />
            Previous
          </button>
          <button
            type="button"
            onClick={next}
            className="text-label group inline-flex items-center gap-4 p-2 text-bone hover:text-cyan"
          >
            Next
            <span aria-hidden className="h-px w-8 bg-current transition-all group-hover:w-12" />
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
