"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

/**
 * Scroll-linked motion for descendants, measured across the scroll range of
 * their closest `[data-parallax-row]` (or the element itself):
 *
 * - `data-speed`  vertical travel as a fraction of the viewport height; positive moves up as you scroll down.
 * - `data-drift`  horizontal travel as a fraction of the viewport width.
 * - `data-rotate` rotation in degrees across the range.
 * - `data-shift`  vertical travel as a percentage of the element's own height (for images inside a frame).
 * - `data-rise`   one-shot reveal: slides up into place when its row enters view.
 *                 Optional value is a delay in seconds.
 * - `data-draw`   scales from 0 to 1 horizontally as its row scrolls into view.
 *
 * Disabled with reduced motion.
 */
export function Parallax({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const rowOf = (el: HTMLElement) => el.closest<HTMLElement>("[data-parallax-row]") ?? el;
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-speed], [data-drift], [data-rotate], [data-shift]").forEach((el) => {
        const speed = Number(el.dataset.speed ?? 0);
        const drift = Number(el.dataset.drift ?? 0);
        const rotate = Number(el.dataset.rotate ?? 0);
        const shift = Number(el.dataset.shift ?? 0);
        const from: gsap.TweenVars = {};
        const to: gsap.TweenVars = {
          ease: "none",
          scrollTrigger: { trigger: rowOf(el), start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true },
        };
        if (speed) {
          from.y = () => speed * window.innerHeight * 0.5;
          to.y = () => -speed * window.innerHeight * 0.5;
        }
        if (drift) {
          from.x = () => drift * window.innerWidth * 0.5;
          to.x = () => -drift * window.innerWidth * 0.5;
        }
        if (rotate) {
          from.rotate = rotate;
          to.rotate = -rotate;
        }
        if (shift) {
          from.yPercent = shift;
          to.yPercent = -shift;
        }
        gsap.fromTo(el, from, to);
      });

      root.querySelectorAll<HTMLElement>("[data-rise]").forEach((el) => {
        gsap.from(el, {
          yPercent: 110,
          opacity: 0,
          duration: 1.2,
          delay: Number(el.dataset.rise) || 0,
          ease: "expo.out",
          scrollTrigger: { trigger: rowOf(el), start: "top 78%", once: true },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-draw]").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: rowOf(el), start: "top 90%", end: "top 35%", scrub: 0.6 },
          },
        );
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
