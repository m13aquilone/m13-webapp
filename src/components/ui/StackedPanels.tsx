"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

/**
 * Scroll behaviour for stacked sticky panels (`[data-panel]`):
 * - while the next panel slides up, the one underneath recedes
 *   (`[data-panel-inner]` scales down and fades);
 * - `[data-panel-dot]` elements get `data-active` for the panel currently in view.
 * The receding effect is disabled with reduced motion.
 */
export function StackedPanels({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-panel]"));
      const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-panel-dot]"));
      const setActive = (i: number) =>
        dots.forEach((dot, k) => {
          if (k === i) dot.dataset.active = "";
          else delete dot.dataset.active;
        });
      setActive(0);

      panels.forEach((panel, i) => {
        if (i > 0) {
          ScrollTrigger.create({
            trigger: panel,
            start: "top 55%",
            onEnter: () => setActive(i),
            onLeaveBack: () => setActive(i - 1),
          });
        }

        const next = panels[i + 1];
        const inner = panel.querySelector<HTMLElement>("[data-panel-inner]");
        if (reduced || !next || !inner || next.dataset.panel !== "sticky") return;
        gsap.to(inner, {
          scale: 0.92,
          opacity: 0.25,
          yPercent: -3,
          ease: "none",
          scrollTrigger: {
            trigger: next,
            start: "top bottom",
            end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`,
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
