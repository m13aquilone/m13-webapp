import Image from "next/image";

import type { Visionary } from "@/content/site";
import { SectionHeading } from "@/components/ui/SectionHeading";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

const corner = "absolute size-4 border-cyan opacity-0 transition-all duration-500 ease-out-expo group-hover:opacity-100";

function Portrait({ person }: { person: Visionary }) {
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-graphite">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_100%,rgb(75_83_32/0.5),transparent_72%)] transition-opacity duration-700 group-hover:opacity-0"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_100%,rgb(75_83_32/0.85),rgb(0_217_232/0.08)_60%,transparent_80%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
      />
      {person.photo ? (
        <Image
          src={person.photo.src}
          fill
          alt={`Portrait of ${person.name}`}
          sizes="(min-width: 768px) 30vw, 45vw"
          loading="lazy"
          className="origin-bottom object-cover object-bottom transition-[transform,filter] duration-700 ease-out-expo group-hover:scale-[1.07] [@media(hover:hover)]:grayscale-[40%] [@media(hover:hover)]:group-hover:grayscale-0"
        />
      ) : (
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-3 border border-line md:inset-4" />
          <span className="text-label absolute bottom-6 left-6 text-ash/70 md:bottom-8 md:left-8">
            {initials(person.name)}
          </span>
        </div>
      )}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-ink/60 to-transparent" />
      <span aria-hidden className={`${corner} top-3 left-3 border-t border-l group-hover:top-4 group-hover:left-4`} />
      <span aria-hidden className={`${corner} top-3 right-3 border-t border-r group-hover:top-4 group-hover:right-4`} />
      <span aria-hidden className={`${corner} bottom-3 left-3 border-b border-l group-hover:bottom-4 group-hover:left-4`} />
      <span aria-hidden className={`${corner} right-3 bottom-3 border-r border-b group-hover:right-4 group-hover:bottom-4`} />
    </div>
  );
}

export function Visionaries({ visionaries }: { visionaries: Visionary[] }) {
  return (
    <section aria-labelledby="visionaries-heading" className="border-t border-line py-24 md:py-40">
      <div className="container-edge">
        <SectionHeading id="visionaries-heading" aside={`(${String(visionaries.length).padStart(2, "0")})`}>
          Visionaries
        </SectionHeading>
        <ul className="mt-14 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-8 lg:gap-12">
          {visionaries.map((person) => (
            <li
              key={person.name}
              data-reveal
              className="group grid grid-cols-[minmax(0,44%)_1fr] items-end gap-5 md:block"
            >
              <Portrait person={person} />
              <div className="relative border-t border-line pt-4 md:mt-6 md:pt-5">
                <span
                  aria-hidden
                  className="absolute -top-px left-0 h-px w-full origin-left scale-x-0 bg-cyan transition-transform duration-700 ease-out-expo group-hover:scale-x-100"
                />
                <p className="wdth-wide text-base font-[650] tracking-[0.01em] text-bone transition-transform duration-500 ease-out-expo group-hover:translate-x-1 sm:text-lg md:text-xl">
                  {person.name}
                </p>
                <p className="text-label mt-3 text-ash transition-colors duration-500 group-hover:text-cyan">
                  {person.designation}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
