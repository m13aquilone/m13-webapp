"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { copy, site, type HeroSequence } from "@/content/site";

const frameSrc = (seq: HeroSequence, i: number) => `${seq.path}/${String(i + 1).padStart(3, "0")}.webp`;

/**
 * Scroll-scrubbed image sequence: the frames play like a video as the hero
 * scrolls. The canvas and poster multiply onto the stage's paper background, so
 * nothing between them and the stage may create a stacking context (transforms,
 * containment, opacity, filters), or the white frame background shows. Frame 1 is a regular image (shown with reduced motion and until the
 * canvas has drawn); the rest load in order in the background.
 */
export function Hero({ sequence }: { sequence?: HeroSequence }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const animated = !!sequence && sequence.count > 1;

  useEffect(() => {
    if (!animated || !sequence) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!section || !stage || !frame || !canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const last = sequence.count - 1;
    const hold = Math.min(last, Math.max(0, (sequence.releaseAt ?? sequence.count) - 1)) / last;
    let target = 0;
    let progress = 0;
    // Pinned part of the scroll plays frames up to releaseAt; the rest play while the hero scrolls away.
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        const pinned = (section.offsetHeight - stage.offsetHeight) / section.offsetHeight;
        const p = self.progress;
        target = p <= pinned ? (p / pinned) * hold : hold + ((p - pinned) / (1 - pinned)) * (1 - hold);
      },
    });

    let drawn = -1;
    let raf = 0;
    let visible = true;
    const images: HTMLImageElement[] = [];
    const ready: boolean[] = new Array(sequence.count).fill(false);
    let cancelled = false;
    let next = 0;
    const loadNext = () => {
      if (cancelled || next > last) return;
      const i = next++;
      const img = new window.Image();
      img.decoding = "async";
      img.src = frameSrc(sequence, i);
      images[i] = img;
      img
        .decode()
        .then(() => {
          ready[i] = true;
          if (Math.abs(i - Math.round(progress * last)) < 2) drawn = -1;
        })
        .catch(() => {})
        .finally(loadNext);
    };
    for (let k = 0; k < 6; k++) loadNext();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let fit = { x: 0, y: 0, w: 0, h: 0 };
    const resize = () => {
      canvas.width = Math.round(frame.offsetWidth * dpr);
      canvas.height = Math.round(frame.offsetHeight * dpr);
      const scale = Math.min(canvas.width / sequence.width, canvas.height / sequence.height);
      const w = sequence.width * scale;
      const h = sequence.height * scale;
      fit = { x: (canvas.width - w) / 2, y: (canvas.height - h) / 2, w, h };
      drawn = -1;
    };

    const nearestReady = (i: number) => {
      for (let d = 0; d <= last; d++) {
        if (i - d >= 0 && ready[i - d]) return i - d;
        if (i + d <= last && ready[i + d]) return i + d;
      }
      return -1;
    };

    function tick() {
      raf = 0;
      if (!visible) return;
      progress += (target - progress) * 0.14;
      if (Math.abs(target - progress) < 0.0005) progress = target;

      const index = nearestReady(Math.round(progress * last));
      if (index !== -1 && index !== drawn) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        ctx!.drawImage(images[index], fit.x, fit.y, fit.w, fit.h);
        if (drawn === -1 && posterRef.current) posterRef.current.style.opacity = "0";
        drawn = index;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      raf = requestAnimationFrame(tick);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(frame);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(stage);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      trigger.kill();
      ro.disconnect();
      io.disconnect();
    };
  }, [animated, sequence]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className={`relative ${animated ? "h-[360vh] motion-reduce:h-auto" : ""}`}
    >
      <div
        ref={stageRef}
        className={`relative flex min-h-[600px] flex-col overflow-hidden bg-paper ${
          animated ? "sticky top-0 h-dvh motion-reduce:relative" : "min-h-dvh"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_42%_at_50%_32%,rgb(75_83_32/0.08),transparent_70%)] lg:bg-[radial-gradient(36%_50%_at_28%_50%,rgb(75_83_32/0.08),transparent_70%)]"
        />

        {sequence && (
          <div
            ref={frameRef}
            role="img"
            aria-label={sequence.alt}
            className="absolute inset-x-2 top-[11dvh] h-[40dvh] sm:inset-x-[8%] lg:inset-y-[6dvh] lg:right-[50%] lg:left-[1%] lg:h-auto"
          >
            <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full mix-blend-multiply" />
            <Image
              ref={posterRef}
              src={frameSrc(sequence, 0)}
              alt=""
              fill
              sizes="(min-width: 1024px) 62vw, 95vw"
              preload
              className="object-contain mix-blend-multiply"
            />
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-paper via-paper/90 to-transparent lg:hidden"
        />

        <div className="container-edge relative flex flex-1 flex-col justify-end pt-32 pb-8 lg:pb-[11vh]">
          <div className="lg:ml-auto lg:w-[47%]">
            <p className="text-label flex items-center gap-4 text-muted">
              <span aria-hidden className="h-px w-10 bg-olive" />
              {site.company.displayName}
            </p>
            <h1
              id="hero-heading"
              className="mt-5 text-[clamp(2.7rem,11.5vw,5.2rem)] leading-[0.88] tracking-[-0.045em] text-fg lg:mt-8 lg:text-[clamp(3.75rem,5.5vw,7.25rem)]"
            >
              <span className="wdth-wide block font-[720]">{copy.hero.headline[0]}</span>
              <span className="text-gradient block w-fit pr-[0.1em] pl-[0.06em] font-serif font-normal italic tracking-[-0.025em] lg:pl-[1.1em]">
                {copy.hero.headline[1]}
              </span>
            </h1>
            <p className="mt-5 max-w-[30rem] text-[0.95rem] leading-relaxed text-muted sm:text-lg lg:mt-10 lg:ml-[clamp(4rem,6vw,8rem)] lg:text-[clamp(1rem,1.15vw,1.2rem)]">
              {copy.hero.description}
            </p>
          </div>
        </div>

        <div className="container-edge relative pb-6 lg:pb-7">
          <div className="flex items-center gap-4 border-t border-line pt-4 text-muted lg:pt-5">
            <span aria-hidden className="relative block h-9 w-px overflow-hidden bg-line">
              <span className="scroll-cue-line absolute inset-0 bg-fg" />
            </span>
            <span className="text-label">Scroll</span>
          </div>
          {animated && (
            <div aria-hidden className="relative mt-3 h-px bg-line motion-reduce:hidden">
              <span
                ref={barRef}
                className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-olive to-cyan"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
