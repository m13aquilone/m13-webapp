"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Vertical } from "@/content/site";
import { Parallax } from "@/components/ui/Parallax";

const pad = (n: number) => String(n).padStart(2, "0");

function Logo({ vertical, sizes }: { vertical: Vertical; sizes: string }) {
  if (!vertical.logo) return null;
  const aspect = vertical.logo.width / vertical.logo.height;
  return (
    <Image
      src={vertical.logo.src}
      width={vertical.logo.width}
      height={vertical.logo.height}
      alt={`${vertical.name} logo`}
      loading="lazy"
      sizes={sizes}
      className="h-auto max-h-full object-contain"
      style={{ width: aspect > 1.3 ? "min(88%, 26rem)" : "min(62%, 17rem)" }}
    />
  );
}

/**
 * Verticals as an interactive index: the row crossing the middle of the
 * viewport (or under the pointer) becomes active, lighting its name and
 * swapping the sticky logo stage and counter beside the list.
 */
export function Verticals({ verticals }: { verticals: Vertical[] }) {
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const total = verticals.length;

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    rows.current.forEach((row) => row && io.observe(row));
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="verticals-heading" className="relative border-t border-line py-24 md:py-40">
      <Parallax className="container-edge">
        <h2 id="verticals-heading" data-parallax-row className="wdth-wide text-headline font-[680] text-fg">
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-rise className="block">
              Business
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-rise="0.12" className="text-outline block">
              Verticals
            </span>
          </span>
        </h2>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-8">
          <div aria-hidden className="hidden lg:sticky lg:top-28 lg:col-span-5 lg:block lg:self-start">
            <div className="relative aspect-[4/3] max-h-[52dvh] w-full">
              {verticals.map((v, i) => (
                <div
                  key={v.name}
                  className={`absolute inset-0 flex items-center justify-center transition-[opacity,scale,filter] duration-[900ms] ease-smooth ${
                    i === active ? "scale-100 opacity-100 blur-0" : "scale-95 opacity-0 blur-sm"
                  }`}
                >
                  <Logo vertical={v} sizes="35vw" />
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-end gap-8">
              <div className="wdth-expanded h-[1em] overflow-hidden text-[clamp(5rem,9vw,8.5rem)] font-[800] leading-none tracking-[-0.05em]">
                <div
                  className="transition-[translate] duration-[900ms] ease-smooth"
                  style={{ translate: `0 ${(-active / total) * 100}%` }}
                >
                  {verticals.map((v, i) => (
                    <span key={v.name} className="text-outline block h-[1em]">
                      {pad(i + 1)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-3 flex flex-1 items-center gap-4">
                <span className="relative h-px flex-1 bg-line">
                  <span
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-olive to-cyan transition-[width] duration-700 ease-smooth"
                    style={{ width: `${((active + 1) / total) * 100}%` }}
                  />
                </span>
                <span className="text-label tabular-nums text-muted">{pad(total)}</span>
              </div>
            </div>
          </div>

          <ol className="border-t border-line lg:col-span-6 lg:col-start-7">
            {verticals.map((v, i) => {
              const [first, ...rest] = v.name.split(/\s+/);
              const body = (
                <div className="flex items-baseline gap-5 md:gap-8">
                  <span className="text-label w-8 shrink-0 tabular-nums text-muted transition-colors duration-500 group-data-[active]/row:text-olive">
                    {pad(i + 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    {v.logo && (
                      <div className="mb-8 flex h-24 items-center lg:hidden">
                        <Logo vertical={v} sizes="60vw" />
                      </div>
                    )}
                    <h3 className="text-[clamp(2.2rem,4.6vw,4.4rem)] leading-[0.92] tracking-[-0.045em] text-fg transition-[opacity,translate] duration-700 ease-smooth lg:opacity-25 lg:group-data-[active]/row:translate-x-3 lg:group-data-[active]/row:opacity-100">
                      <span className="wdth-wide block font-[760]">{first}</span>
                      {rest.length > 0 && (
                        <span className="text-outline wdth-wide block font-[800] [-webkit-text-stroke-width:clamp(1px,0.12vw,2px)]">
                          {rest.join(" ")}
                        </span>
                      )}
                    </h3>
                    {v.description && (
                      <p className="mt-6 max-w-lg text-base leading-relaxed text-muted transition-[opacity,translate] duration-700 ease-smooth md:text-lg lg:translate-y-2 lg:opacity-30 lg:group-data-[active]/row:translate-x-3 lg:group-data-[active]/row:translate-y-0 lg:group-data-[active]/row:opacity-100">
                        {v.description}
                      </p>
                    )}
                    {v.href && (
                      <span className="text-label mt-6 inline-flex items-center gap-3 text-fg lg:ml-3">
                        Explore
                        <span aria-hidden className="h-px w-6 bg-current transition-[width] duration-500 group-hover/row:w-10" />
                      </span>
                    )}
                  </div>
                </div>
              );
              return (
                <li
                  key={v.name}
                  ref={(el) => {
                    rows.current[i] = el;
                  }}
                  data-index={i}
                  data-active={i === active ? "" : undefined}
                  onPointerEnter={() => setActive(i)}
                  className="group/row relative border-b border-line py-12 md:py-16 lg:py-20"
                >
                  {v.href ? (
                    <Link href={v.href} className="block">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-gradient-to-r from-olive to-cyan transition-[scale] duration-[900ms] ease-smooth group-data-[active]/row:scale-x-100"
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </Parallax>
    </section>
  );
}
