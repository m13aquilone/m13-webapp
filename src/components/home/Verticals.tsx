import Image from "next/image";
import Link from "next/link";

import type { Vertical } from "@/content/site";
import { Parallax } from "@/components/ui/Parallax";
import { StackedPanels } from "@/components/ui/StackedPanels";

const pad = (n: number) => String(n).padStart(2, "0");

function Logo({ vertical }: { vertical: Vertical }) {
  if (!vertical.logo) return null;
  const aspect = vertical.logo.width / vertical.logo.height;
  return (
    <Image
      src={vertical.logo.src}
      width={vertical.logo.width}
      height={vertical.logo.height}
      alt={`${vertical.name} logo`}
      loading="lazy"
      sizes="(min-width: 768px) 30vw, 50vw"
      className="h-auto max-h-full object-contain"
      style={{ width: aspect > 1.3 ? "min(100%, 26rem)" : "min(62%, 16rem)" }}
    />
  );
}

function Panel({ vertical, index, sticky }: { vertical: Vertical; index: number; sticky: boolean }) {
  const flip = index % 2 === 1;
  const [first, ...rest] = vertical.name.split(/\s+/);

  const inner = (
    <div data-panel-inner className="container-edge relative flex h-full origin-top flex-col py-6 md:py-10">
      <span
        aria-hidden
        data-speed="0.3"
        data-drift="0.03"
        data-rotate="5"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 select-none ${flip ? "left-[-2vw]" : "right-[-2vw]"}`}
      >
        <span
          className="ghost-float text-outline wdth-expanded block text-[clamp(10rem,34vw,32rem)] font-[800] leading-none tracking-[-0.06em] opacity-[0.22] [-webkit-text-stroke-width:1.5px]"
          style={{ animationDelay: `${index * -4}s` }}
        >
          {pad(index + 1)}
        </span>
      </span>

      <div className="relative grid min-h-0 flex-1 grid-rows-[minmax(0,0.7fr)_auto] items-center gap-6 md:grid-cols-12 md:grid-rows-1 md:gap-8">
        <div
          data-speed="0.12"
          className={`flex h-full min-h-0 items-center justify-center md:col-span-5 ${
            flip ? "md:order-1 md:col-start-1 md:justify-start" : "md:order-2 md:col-start-8 md:justify-end"
          }`}
        >
          <Logo vertical={vertical} />
        </div>

        <div className={`md:col-span-7 ${flip ? "md:order-2 md:col-start-6" : "md:order-1"}`}>
          <h3 className="text-[clamp(2.6rem,8vw,9rem)] leading-[0.88] tracking-[-0.045em] text-fg">
            <span className="block w-fit overflow-hidden pb-[0.06em]">
              <span data-rise="0.05" className="wdth-wide block font-[760]">
                {first}
              </span>
            </span>
            {rest.length > 0 && (
              <span className="block w-fit overflow-hidden pr-[0.1em] pb-[0.08em]">
                <span
                  data-rise="0.18"
                  className="text-outline wdth-wide block font-[800] tracking-[-0.04em] [-webkit-text-stroke-width:clamp(1px,0.14vw,2px)]"
                >
                  {rest.join(" ")}
                </span>
              </span>
            )}
          </h3>
          {vertical.description && (
            <p
              data-rise="0.3"
              className="mt-5 max-w-[34rem] text-[0.95rem] leading-relaxed text-muted md:mt-10 md:ml-[10%] md:text-lg lg:text-xl lg:leading-relaxed"
            >
              {vertical.description}
            </p>
          )}
          {vertical.href && (
            <span className="text-label mt-6 inline-flex items-center gap-3 text-fg md:ml-[10%]">
              Explore
              <span aria-hidden className="h-px w-6 bg-current transition-[width] duration-500 group-hover:w-10" />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      role="listitem"
      data-panel={sticky ? "sticky" : "flow"}
      data-parallax-row
      className={`relative h-[calc(100dvh-4.5rem-var(--vh-bar))] min-h-[30rem] overflow-hidden bg-paper ${
        sticky ? "sticky top-[calc(4.5rem+var(--vh-bar))]" : ""
      } ${index > 0 ? "shadow-[0_-30px_60px_-34px_rgb(20_22_19/0.18)]" : ""}`}
    >
      {vertical.href ? (
        <Link href={vertical.href} className="group block h-full">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

export function Verticals({ verticals }: { verticals: Vertical[] }) {
  const pinned = verticals.slice(0, -1);
  const last = verticals[verticals.length - 1];

  return (
    <section
      aria-labelledby="verticals-heading"
      className="relative border-t border-line bg-paper"
      style={{ "--vh-bar": "calc(clamp(2.5rem, 7vw, 7rem) * 0.9 + 3.5rem)" } as React.CSSProperties}
    >
      <Parallax>
        <StackedPanels>
          <div className="relative">
            <div className="sticky top-[4.5rem] z-10 h-[var(--vh-bar)] bg-paper">
              <div className="container-edge flex h-full items-end justify-between gap-6 pb-5">
                <h2 id="verticals-heading" className="wdth-wide text-headline font-[680] text-fg">
                  Business Verticals
                </h2>
                <ol aria-hidden className="text-label flex shrink-0 items-center gap-4 pb-2 tabular-nums md:gap-6">
                  {verticals.map((v, i) => (
                    <li
                      key={v.name}
                      data-panel-dot
                      className="group/dot relative pb-2 text-muted transition-colors duration-500 data-[active]:text-fg"
                    >
                      {pad(i + 1)}
                      <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-olive to-cyan transition-[scale] duration-500 ease-smooth group-data-[active]/dot:scale-x-100" />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div role="list">
              {pinned.map((v, i) => (
                <Panel key={v.name} vertical={v} index={i} sticky />
              ))}
            </div>
          </div>
          {last && (
            <div role="list">
              <Panel vertical={last} index={verticals.length - 1} sticky={false} />
            </div>
          )}
        </StackedPanels>
      </Parallax>
    </section>
  );
}
