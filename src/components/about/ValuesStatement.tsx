"use client";

import { useEffect, useRef, useState } from "react";

/** Delay between words, so the line reads as if it is being written. */
const STEP = 260;

function Word({ on, index, children, className = "" }: { on: boolean; index: number; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block origin-bottom-left transition-[translate,scale,opacity,filter] duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${
        on ? "translate-y-0 scale-100 opacity-100 blur-0" : "translate-y-[0.35em] scale-75 opacity-0 blur-[6px]"
      } ${className}`}
      style={{ transitionDelay: on ? `${index * STEP}ms` : "0ms" }}
    >
      {children}
    </span>
  );
}

/**
 * "Not just us, always we": each word pops in one after another when the
 * statement scrolls into view. Colours match the static layout.
 */
export function ValuesStatement({ values }: { values: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [on, setOn] = useState(false);

  const words = values.split(" ");
  const last = words.pop() ?? "";
  const [first = "", second = "", third = "", ...rest] = words;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <p
      ref={ref}
      className="wdth-expanded mt-10 px-[clamp(1.25rem,4vw,3.5rem)] text-[clamp(3.4rem,12vw,13.5rem)] font-[800] uppercase leading-[0.86] tracking-[-0.055em] text-fg md:mt-14"
    >
      <span className="sr-only">{values}</span>
      <span aria-hidden className="flex flex-wrap gap-x-[0.28em]">
        <Word on={on} index={0}>
          {first}
        </Word>
        <Word on={on} index={1}>
          {second}
        </Word>
      </span>
      <span aria-hidden className="flex flex-wrap items-baseline gap-x-[0.28em]">
        <Word on={on} index={2}>
          {third}
        </Word>
        {rest.map((word, i) => (
          <Word
            key={word + i}
            on={on}
            index={3 + i}
            className="font-serif text-[0.66em] font-normal normal-case italic tracking-[-0.02em] text-muted [font-stretch:100%] [font-variation-settings:normal]"
          >
            {word}
          </Word>
        ))}
      </span>
      <span aria-hidden className="block text-right">
        <Word on={on} index={3 + rest.length} className="origin-bottom-right">
          <span className="text-outline [-webkit-text-stroke-width:clamp(1px,0.18vw,2.5px)]">{last}</span>
        </Word>
      </span>
    </p>
  );
}
