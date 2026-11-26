"use client";

import { useEffect, useRef } from "react";

/**
 * Wraps a CSS marquee (`.marquee-track`) and ties its speed to scrolling:
 * it speeds up while the page scrolls and runs backwards when scrolling up,
 * then eases back to its normal pace. Disabled with reduced motion.
 */
export function VelocityMarquee({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const track = root.querySelector<HTMLElement>(".marquee-track");
    const animation = track?.getAnimations()[0];
    if (!animation) return;
    const loop = Number(animation.effect?.getTiming().duration) || 0;
    animation.currentTime = (Number(animation.currentTime) || 0) + loop * 1000;

    let lastY = window.scrollY;
    let lastT = performance.now();
    let boost = 0;
    let direction = 1;
    let raf = 0;
    let visible = false;

    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastY;
      const dt = Math.max(16, now - lastT);
      lastY = window.scrollY;
      lastT = now;
      if (dy !== 0) direction = dy > 0 ? 1 : -1;
      boost = Math.min(6, Math.max(boost, (Math.abs(dy) / dt) * 3));
    };
    const tick = () => {
      boost *= 0.92;
      animation.playbackRate = direction * (1 + boost);
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(root);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      animation.playbackRate = 1;
    };
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
