import type { Metadata } from "next";

import { copy, site } from "@/content/site";

export const metadata: Metadata = {
  title: "About us",
  description: copy.about.intro[0],
};

export default function AboutPage() {
  const { intro, mission, vision, values } = copy.about;
  const valueWords = values.split(" ");
  const lastWord = valueWords.pop();

  return (
    <>
      {/* Introduction */}
      <section aria-labelledby="about-heading" className="pb-24 pt-36 md:pb-40 md:pt-48">
        <div className="container-edge">
          <p data-reveal className="text-label flex items-center gap-4 text-ash">
            <span aria-hidden className="h-px w-10 bg-olive" />
            {site.company.displayName}
          </p>
          <h1
            id="about-heading"
            data-reveal
            className="wdth-expanded text-display mt-8 font-[760] text-bone"
          >
            About <span className="font-serif font-normal italic tracking-[-0.02em] [font-stretch:100%] [font-variation-settings:normal]">us</span>
          </h1>

          <div className="mt-16 grid gap-10 border-t border-line pt-10 md:mt-24 md:grid-cols-12 md:gap-8 md:pt-14">
            <p
              data-reveal
              className="text-[clamp(1.375rem,2.4vw,2.25rem)] font-[420] leading-[1.25] tracking-[-0.015em] text-bone md:col-span-6"
            >
              {intro[0]}
            </p>
            <div className="space-y-6 text-base leading-relaxed text-ash md:col-span-5 md:col-start-8 md:pt-2 md:text-lg">
              <p data-reveal>{intro[1]}</p>
              <p data-reveal className="text-bone">
                {intro[2]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission: olive surface band, sticky label + large lead */}
      <section aria-labelledby="mission-heading" className="bg-olive-deep">
        <div className="container-edge grid gap-10 py-24 md:grid-cols-12 md:gap-8 md:py-40">
          <div className="md:col-span-3">
            <div className="md:sticky md:top-28">
              <h2 id="mission-heading" data-reveal className="text-label flex items-center gap-4 text-bone">
                <span aria-hidden className="h-px w-10 bg-olive" />
                Mission
              </h2>
            </div>
          </div>
          <div className="md:col-span-8 md:col-start-5">
            <p
              data-reveal
              className="wdth-wide text-[clamp(1.75rem,3.6vw,3.5rem)] font-[560] leading-[1.08] tracking-[-0.03em] text-bone"
            >
              {mission[0]}
            </p>
            <p data-reveal className="mt-10 max-w-xl border-l border-olive pl-6 text-lg leading-relaxed text-bone/80 md:mt-14">
              {mission[1]}
            </p>
          </div>
        </div>
      </section>

      {/* Vision: single centred serif statement between fine rules */}
      <section aria-labelledby="vision-heading" className="py-24 md:py-40">
        <div className="container-edge">
          <div className="border-y border-line py-16 text-center md:py-28">
            <h2 id="vision-heading" data-reveal className="text-label text-ash">
              Vision
            </h2>
            <p
              data-reveal
              className="mx-auto mt-10 max-w-[18ch] font-serif text-[clamp(2.4rem,6.2vw,6rem)] italic leading-[1.02] tracking-[-0.02em] text-bone md:mt-14"
            >
              {vision}
            </p>
          </div>
        </div>
      </section>

      {/* Values: full-bleed typographic statement */}
      <section aria-labelledby="values-heading" className="overflow-hidden pb-28 md:pb-48">
        <div className="container-edge">
          <h2 id="values-heading" data-reveal className="text-label flex items-center gap-4 text-ash">
            <span aria-hidden className="h-px w-10 bg-olive" />
            Values
          </h2>
        </div>
        <p
          data-reveal
          className="wdth-expanded mt-10 px-[clamp(1.25rem,4vw,3.5rem)] text-[clamp(3.4rem,12vw,13.5rem)] font-[800] uppercase leading-[0.86] tracking-[-0.055em] text-bone md:mt-14"
        >
          <span className="sr-only">{values}</span>
          <span aria-hidden className="block">{valueWords.slice(0, 2).join(" ")}</span>
          <span aria-hidden className="flex flex-wrap items-baseline gap-x-[0.28em]">
            <span>{valueWords[2]}</span>
            <span className="font-serif text-[0.66em] font-normal normal-case italic tracking-[-0.02em] text-ash [font-stretch:100%] [font-variation-settings:normal]">
              {valueWords.slice(3).join(" ")}
            </span>
          </span>
          <span aria-hidden className="block text-right">
            <span className="text-outline [-webkit-text-stroke-width:clamp(1px,0.18vw,2.5px)]">{lastWord}</span>
          </span>
        </p>
      </section>
    </>
  );
}
