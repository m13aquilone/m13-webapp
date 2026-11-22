import Image from "next/image";
import Link from "next/link";

import type { Vertical } from "@/content/site";
import { SectionHeading } from "@/components/ui/SectionHeading";

function Mark({ vertical }: { vertical: Vertical }) {
  if (vertical.logo) {
    const aspect = vertical.logo.width / vertical.logo.height;
    return (
      <Image
        src={vertical.logo.src}
        width={vertical.logo.width}
        height={vertical.logo.height}
        alt={`${vertical.name} logo`}
        loading="lazy"
        sizes="(min-width: 768px) 22vw, 60vw"
        className="relative h-auto object-contain transition-transform duration-700 ease-out-expo group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
        style={{ width: aspect > 1.3 ? "68%" : "52%", maxHeight: "70%" }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="wdth-expanded relative text-center uppercase text-[clamp(2.5rem,6vw,5.25rem)] font-[800] leading-[0.85] tracking-[-0.05em] text-bone transition-transform duration-700 ease-out-expo group-hover:-translate-y-1.5 group-hover:scale-[1.06]"
    >
      {vertical.name.split(/\s+/).map((word) => (
        <span key={word} className="block">
          {word}
        </span>
      ))}
    </span>
  );
}

function Card({ vertical, index }: { vertical: Vertical; index: number }) {
  const body = (
    <>
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border border-line bg-graphite transition-colors duration-500 group-hover:border-line-strong">
        <div
          aria-hidden
          className="absolute inset-0 translate-y-1/3 bg-[radial-gradient(90%_70%_at_50%_100%,rgb(75_83_32/0.7),transparent_70%)] opacity-0 transition-[opacity,transform] duration-700 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100"
        />
        <span className="text-label absolute top-5 left-5 text-ash">{String(index + 1).padStart(2, "0")}</span>
        <Mark vertical={vertical} />
      </div>
      <div className="relative flex items-start justify-between gap-4 pt-5">
        <span
          aria-hidden
          className="absolute top-0 left-0 h-px w-full origin-left scale-x-0 bg-cyan transition-transform duration-700 ease-out-expo group-hover:scale-x-100"
        />
        <h3 className="wdth-wide text-lg font-[650] tracking-[-0.01em] text-bone md:text-xl">{vertical.name}</h3>
        {vertical.href && (
          <span aria-hidden className="text-ash transition-[color,transform] duration-500 group-hover:translate-x-1 group-hover:text-cyan">
            →
          </span>
        )}
      </div>
    </>
  );

  return (
    <li data-reveal>
      {vertical.href ? (
        <Link href={vertical.href} className="group block">
          {body}
        </Link>
      ) : (
        <div className="group">{body}</div>
      )}
    </li>
  );
}

export function Verticals({ verticals }: { verticals: Vertical[] }) {
  return (
    <section aria-labelledby="verticals-heading" className="py-24 md:py-40">
      <div className="container-edge">
        <SectionHeading id="verticals-heading" aside={`(${String(verticals.length).padStart(2, "0")})`}>
          Business Verticals
        </SectionHeading>
        <ul className="mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-6 lg:gap-8">
          {verticals.map((v, i) => (
            <Card key={v.name} vertical={v} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
