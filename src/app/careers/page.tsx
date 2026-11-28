import type { Metadata } from "next";

import { CareersForm } from "@/components/careers/CareersForm";
import { copy, site } from "@/content/site";

export const metadata: Metadata = {
  title: "Careers",
  description: `Careers at ${site.company.displayName}.`,
};

export default function CareersPage() {
  const { careersEndpoint, company } = site;

  return (
    <section aria-labelledby="careers-heading" className="wash-cyan pb-24 pt-36 md:pb-40 md:pt-48">
      <div className="container-edge">
        <div className="border-b border-line pb-10 md:pb-14">
          <p data-reveal className="text-label flex items-center gap-4 text-muted">
            <span aria-hidden className="h-px w-10 bg-olive" />
            {company.displayName}
          </p>
          <h1 id="careers-heading" data-reveal className="wdth-expanded text-display mt-8 font-[760] text-fg">
            Careers
          </h1>
        </div>

        <div className="mt-14 grid gap-14 md:mt-20 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <p
              data-reveal
              className="font-serif text-[clamp(2rem,3.6vw,3.5rem)] italic leading-[1.02] tracking-[-0.02em] text-fg"
            >
              {copy.about.values}.
            </p>
            <p data-reveal className="mt-6 max-w-sm text-base leading-relaxed text-muted md:text-lg">
              Share your details below and tell us about yourself.
            </p>
          </div>

          <div data-reveal className="md:col-span-7 md:col-start-6">
            {careersEndpoint ? (
              <CareersForm endpoint={careersEndpoint} />
            ) : company.email ? (
              <p className="text-lg text-muted">
                Send your details to{" "}
                <a href={`mailto:${company.email}`} className="text-fg transition-colors hover:text-cyan">
                  {company.email}
                </a>
                .
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
