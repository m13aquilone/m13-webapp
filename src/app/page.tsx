import type { Metadata } from "next";

import { Partners } from "@/components/home/Partners";
import { Verticals } from "@/components/home/Verticals";
import { Visionaries } from "@/components/home/Visionaries";
import { Hero } from "@/components/hero/Hero";
import { copy, site } from "@/content/site";
import { getHeroSequence, getPartners, getVerticals, getVisionaries } from "@/lib/assets";

export const metadata: Metadata = {
  title: { absolute: `${site.company.displayName} | ${copy.hero.headline.join(" ")}` },
  description: copy.hero.description,
};

export default function Home() {
  return (
    <>
      <Hero sequence={getHeroSequence()} />
      <Verticals verticals={getVerticals()} />
      <Visionaries visionaries={getVisionaries()} />
      <Partners partners={getPartners()} />
    </>
  );
}
