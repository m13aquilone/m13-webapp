"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { copy, site, type ImageAsset } from "@/content/site";

import {
  buildTransition,
  clamp01,
  drawTransition,
  easeInOutCubic,
  sampleImage,
  segmentAt,
  smoothstep,
  type Box,
  type Transition,
} from "./morph";
import { createLiquid, type Liquid } from "./liquid";

type Frame = ImageAsset & { alt: string; caption?: string };
type Mode = "liquid" | "prism" | "particles";

/** Prism mode: number of slats and the delay between neighbouring slats (fraction of a transition). */
const SLATS = 8;
const STAGGER = 0.06;

/** How much of the canvas extends beyond the image area, so bursts aren't clipped. */
const BLEED = 0.18;

export function Hero({ frames, transition = "liquid" }: { frames: Frame[]; transition?: Mode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prismRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const captionRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRef = useRef<HTMLSpanElement>(null);

  const animated = frames.length > 1;
  const prism = transition === "prism";
  const liquidMode = transition === "liquid";

  useEffect(() => {
    if (!animated) return;
    const section = sectionRef.current;
    const stage = stageRef.current;
    const visual = visualRef.current;
    const tilt = tiltRef.current;
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    const prismBox = prismRef.current;
    const glCanvas = glRef.current;
    if (!section || !stage || !visual || !tilt || !frame) return;
    if (prism ? !prismBox : liquidMode ? !glCanvas : !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const compact = window.matchMedia("(max-width: 1023px)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const ctx = canvas?.getContext("2d") ?? null;
    if (transition === "particles" && !ctx) return;

    gsap.registerPlugin(ScrollTrigger);
    let target = 0;
    let progress = 0;
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        target = self.progress;
      },
    });

    let transitions: Transition[] | null = null;
    let sources: string[] | null = null;
    let liquid: Liquid | null = null;
    let cancelled = false;
    const count = compact ? 2600 : 5200;
    Promise.all(
      imgRefs.current.map((img) =>
        img ? (img.complete && img.naturalWidth ? Promise.resolve() : img.decode()).then(() => img) : Promise.reject(),
      ),
    )
      .then((imgs) => {
        if (cancelled) return;
        if (prism) {
          sources = imgs.map((img) => img.currentSrc || img.src);
          return;
        }
        if (liquidMode && glCanvas) {
          liquid = createLiquid(glCanvas, imgs);
          resize();
          return;
        }
        const clouds = imgs.map((img, i) => sampleImage(img, count, 1301 + i * 7919));
        transitions = clouds.slice(1).map((c, i) => buildTransition(clouds[i], c, 4049 + i * 104729));
      })
      .catch(() => {
        transitions = null;
      });

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let box: Box = { cx: 0, cy: 0, w: 0, h: 0 };
    let half = 0;
    const slats = prismBox ? (Array.from(prismBox.children) as HTMLElement[]) : [];
    const faces = slats.map((slat) => Array.from(slat.children) as HTMLElement[]);
    const shades = faces.map((pair) => pair.map((face) => face.firstElementChild as HTMLElement));
    const glDpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const fit = { w: frame.offsetWidth, h: frame.offsetHeight };
      if (glCanvas) {
        liquid?.resize(Math.round(fit.w * glDpr), Math.round(fit.h * glDpr));
        return;
      }
      if (prismBox) {
        const sw = fit.w / SLATS;
        half = sw / 2;
        slats.forEach((slat, i) => {
          slat.style.left = `${i * sw}px`;
          slat.style.width = `${sw}px`;
          faces[i].forEach((face, k) => {
            face.style.width = `${sw + 1}px`;
            face.style.backgroundSize = `${fit.w}px ${fit.h}px`;
            face.style.backgroundPosition = `${-i * sw}px 0`;
            face.style.transform = `${k === 1 ? "rotateY(90deg) " : ""}translateZ(${half}px)`;
          });
        });
        return;
      }
      if (!canvas) return;
      canvas.width = Math.round(fit.w * (1 + BLEED * 2) * dpr);
      canvas.height = Math.round(fit.h * (1 + BLEED * 2) * dpr);
      box = {
        cx: canvas.width / 2,
        cy: canvas.height / 2,
        w: fit.w * dpr,
        h: fit.h * dpr,
      };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(frame);

    let pointerX = 0;
    let pointerY = 0;
    let tiltX = 0;
    let tiltY = 0;
    const onPointer = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(stage);

    let lastDrawn = false;
    let lastPair = "";
    let prismShown = false;
    let liquidShown = false;
    let lastStep = -1;
    let raf = 0;
    const start = performance.now();

    function styleFrame(i: number, out: number, inn: number) {
      const img = imgRefs.current[i];
      if (!img) return;
      const hide = Math.max(out, inn);
      const turn = out > 0 ? -38 * out : 38 * inn;
      img.style.opacity = String(1 - hide);
      img.style.transform = `translate3d(0,0,${-160 * hide}px) rotateY(${turn}deg) scale(${1 - 0.1 * out + 0.08 * inn})`;
      img.style.filter = hide > 0.001 ? `blur(${hide * 10}px) brightness(${1 + hide * 0.9})` : "none";
    }

    function tick(now: number) {
      raf = 0;
      if (!visible) return;
      progress += (target - progress) * 0.1;
      if (Math.abs(target - progress) < 0.0001) progress = target;

      const { from, to, t } = segmentAt(progress, frames.length);
      const prismActive = prism && sources !== null && from !== to;

      if (prismActive && sources) {
        const pair = `${from}>${to}`;
        if (pair !== lastPair) {
          faces.forEach(([a, b]) => {
            a.style.backgroundImage = `url("${sources![from]}")`;
            b.style.backgroundImage = `url("${sources![to]}")`;
          });
          lastPair = pair;
        }
        if (!prismShown) {
          prismBox!.style.visibility = "visible";
          frames.forEach((_, i) => {
            const img = imgRefs.current[i];
            if (img)
              Object.assign(img.style, {
                opacity: "0",
                transform: "none",
                filter: "none",
              });
          });
          prismShown = true;
        }
        const span = 1 - (SLATS - 1) * STAGGER;
        slats.forEach((slat, i) => {
          const e = easeInOutCubic(clamp01((t - i * STAGGER) / span));
          const pop = Math.sin(Math.PI * e) * half * 1.6;
          slat.style.transform = `translateZ(${pop - half}px) rotateY(${-90 * e}deg)`;
          shades[i][0].style.opacity = String(0.85 * Math.sin((e * Math.PI) / 2));
          shades[i][1].style.opacity = String(0.85 * Math.cos((e * Math.PI) / 2));
        });
        prismBox!.style.transform = `scale(${1 - 0.06 * Math.sin(Math.PI * t)})`;
      } else if (prismShown) {
        prismBox!.style.visibility = "hidden";
        prismShown = false;
      }

      const liquidActive = liquidMode && liquid !== null && from !== to;
      if (liquidActive && liquid) {
        const pair = `${from}>${to}`;
        if (pair !== lastPair) {
          liquid.setPair(from, to);
          lastPair = pair;
        }
        liquid.render(t, (now - start) / 1000);
        if (!liquidShown) {
          glCanvas!.style.visibility = "visible";
          frames.forEach((_, i) => {
            const img = imgRefs.current[i];
            if (img)
              Object.assign(img.style, {
                opacity: "0",
                transform: "none",
                filter: "none",
              });
          });
          liquidShown = true;
        }
      } else if (liquidShown) {
        glCanvas!.style.visibility = "hidden";
        liquidShown = false;
      }

      const morphing = from !== to && transitions !== null;
      const fadeOut = morphing ? smoothstep(0, 0.3, t) : smoothstep(0.05, 0.6, t);
      const fadeIn = morphing ? 1 - smoothstep(0.7, 1, t) : 1 - smoothstep(0.4, 0.95, t);

      if (!prismActive && !liquidActive)
        frames.forEach((_, i) => {
          if (i === from && from === to) styleFrame(i, 0, 0);
          else if (i === from) styleFrame(i, fadeOut, 0);
          else if (i === to) styleFrame(i, 0, fadeIn);
          else styleFrame(i, 0, 1);
        });

      if (morphing && transitions && ctx) {
        drawTransition(ctx, transitions[from], t, box, (compact ? 1.9 : 1.8) * dpr);
        lastDrawn = true;
      } else if (lastDrawn && ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        lastDrawn = false;
      }

      const energy = from !== to ? Math.sin(Math.PI * t) : 0;
      if (glowRef.current) glowRef.current.style.opacity = String(0.35 + energy * 0.65);

      tiltX += (pointerX - tiltX) * 0.06;
      tiltY += (pointerY - tiltY) * 0.06;
      const float = Math.sin((now - start) / 1400) * 8;
      tilt!.style.transform = `translate3d(0,${float}px,0) rotateX(${-tiltY * 7}deg) rotateY(${tiltX * 10}deg)`;

      captionRefs.current.forEach((el, i) => {
        if (!el) return;
        let hide = 1;
        let dir = 1;
        if (i === from) {
          hide = from === to ? 0 : smoothstep(0.15, 0.45, t);
          dir = -1;
        } else if (i === to) {
          hide = 1 - smoothstep(0.55, 0.85, t);
        }
        el.style.opacity = String(1 - hide);
        el.style.transform = `translate3d(0,${dir * hide * 0.9}em,0)`;
      });

      const step = t > 0.5 ? to : from;
      if (step !== lastStep && counterRef.current) {
        counterRef.current.textContent = String(step + 1).padStart(2, "0");
        lastStep = step;
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      trigger.kill();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      liquid?.destroy();
    };
  }, [animated, frames, prism, liquidMode, transition]);

  const sequenceLabel = frames
    .map((f) => (f.caption ? `${f.caption}: ${f.alt}` : f.alt))
    .join(", which transforms into ");
  const hasCaptions = frames.some((f) => f.caption);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className={`relative ${animated ? "h-[360vh] motion-reduce:h-auto" : ""}`}
    >
      <div
        ref={stageRef}
        className={`relative flex min-h-[600px] flex-col overflow-hidden ${
          animated ? "sticky top-0 h-dvh motion-reduce:relative" : "min-h-dvh"
        }`}
      >
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_42%_at_50%_32%,rgb(75_83_32/0.12),transparent_70%)] opacity-35 lg:bg-[radial-gradient(36%_50%_at_70%_50%,rgb(75_83_32/0.12),transparent_70%)]"
        />

        {frames.length > 0 && (
          <div
            ref={visualRef}
            role="img"
            aria-label={sequenceLabel}
            className="absolute inset-x-2 top-[11dvh] h-[40dvh] [container-type:size] [perspective:1400px] sm:inset-x-[8%] lg:inset-y-[6dvh] lg:right-[1%] lg:left-[42%] lg:h-auto"
          >
            <div ref={tiltRef} className="absolute inset-0 [transform-style:preserve-3d] will-change-transform">
              <div
                ref={frameRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]"
                style={{
                  width: `min(100cqw, ${(frames[0].width / frames[0].height) * 100}cqh)`,
                  aspectRatio: `${frames[0].width} / ${frames[0].height}`,
                }}
              >
                {frames.map((frame, i) => (
                  <Image
                    key={frame.src}
                    ref={(el) => {
                      imgRefs.current[i] = el;
                    }}
                    src={frame.src}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 60vw, 90vw"
                    quality={90}
                    preload={i === 0}
                    loading={i === 0 ? undefined : "eager"}
                    className="object-cover will-change-transform"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  />
                ))}
                {liquidMode ? (
                  <canvas
                    ref={glRef}
                    aria-hidden
                    className="pointer-events-none invisible absolute inset-0 h-full w-full"
                  />
                ) : prism ? (
                  <div
                    ref={prismRef}
                    aria-hidden
                    className="pointer-events-none invisible absolute inset-0 [transform-style:preserve-3d]"
                  >
                    {Array.from({ length: SLATS }, (_, i) => (
                      <div key={i} className="absolute top-0 h-full [transform-style:preserve-3d]">
                        {[0, 1].map((k) => (
                          <div key={k} className="absolute inset-y-0 left-0 bg-no-repeat [backface-visibility:hidden]">
                            <span className="absolute inset-0 bg-fg opacity-0" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <canvas
                    ref={canvasRef}
                    aria-hidden
                    className="pointer-events-none absolute"
                    style={{
                      inset: `${-BLEED * 100}%`,
                      width: `${100 + BLEED * 200}%`,
                      height: `${100 + BLEED * 200}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-paper via-paper/90 to-transparent lg:hidden"
        />

        <div className="container-edge relative flex flex-1 flex-col justify-end pt-32 pb-8 lg:pb-[11vh]">
          <p className="text-label flex items-center gap-4 text-muted">
            <span aria-hidden className="h-px w-10 bg-olive" />
            {site.company.displayName}
          </p>
          <h1
            id="hero-heading"
            className="mt-5 text-[clamp(2.7rem,11.5vw,5.2rem)] leading-[0.88] tracking-[-0.045em] text-fg lg:mt-8 lg:text-[clamp(4.5rem,6.6vw,8.6rem)]"
          >
            <span className="wdth-wide block font-[720]">{copy.hero.headline[0]}</span>
            <span className="text-gradient block w-fit pr-[0.1em] pl-[0.06em] font-serif font-normal italic tracking-[-0.025em] lg:pl-[1.1em]">
              {copy.hero.headline[1]}
            </span>
          </h1>
          <p className="mt-5 max-w-[30rem] text-[0.95rem] leading-relaxed text-muted sm:text-lg lg:mt-10 lg:ml-[clamp(5rem,7.3vw,9.5rem)] lg:text-[clamp(1rem,1.15vw,1.2rem)]">
            {copy.hero.description}
          </p>
        </div>

        <div className="container-edge relative pb-6 lg:pb-7">
          <div className="flex items-center justify-between border-t border-line pt-4 text-muted lg:pt-5">
            <div className="flex items-center gap-4">
              <span aria-hidden className="relative block h-9 w-px overflow-hidden bg-line">
                <span className="scroll-cue-line absolute inset-0 bg-fg" />
              </span>
              <span className="text-label">Scroll</span>
            </div>
            {animated && (
              <span aria-hidden className="text-label flex items-center gap-5 tabular-nums">
                {hasCaptions && (
                  <span className="relative block h-[1em] min-w-[9ch] text-right text-fg">
                    {frames.map((frame, i) => (
                      <span
                        key={frame.src}
                        ref={(el) => {
                          captionRefs.current[i] = el;
                        }}
                        className="absolute top-0 right-0 whitespace-nowrap will-change-transform"
                        style={{ opacity: i === 0 ? 1 : 0 }}
                      >
                        {frame.caption}
                      </span>
                    ))}
                  </span>
                )}
                {hasCaptions && <span className="h-px w-8 bg-gradient-to-r from-olive to-cyan" />}
                <span>
                  <span ref={counterRef} className="text-fg">
                    01
                  </span>
                  <span className="mx-2 text-muted/60">/</span>
                  {String(frames.length).padStart(2, "0")}
                </span>
              </span>
            )}
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
