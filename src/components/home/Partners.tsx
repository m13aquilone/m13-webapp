import Image from "next/image";

import type { Partner } from "@/content/site";

/**
 * Optical balancing: every logo gets roughly the same visual area, so wide
 * wordmarks render shorter and compact marks taller. `scale` fine-tunes this.
 */
const TARGET_AREA = 44 * 44 * 3;

/** Each half of the marquee track holds at least this many logos so it always overflows wide screens. */
const MIN_PER_HALF = 10;

function logoSize(partner: Partner) {
  const aspect = partner.logo.width / partner.logo.height;
  const scale = partner.scale ?? 1;
  const height = Math.round(Math.min(72, Math.max(24, Math.sqrt(TARGET_AREA / aspect))) * scale);
  return { height, width: Math.round(height * aspect) };
}

function Logo({ partner, decorative }: { partner: Partner; decorative?: boolean }) {
  const { width, height } = logoSize(partner);
  return (
    <li className="marquee-item flex shrink-0 items-center px-8 md:px-12" aria-hidden={decorative || undefined}>
      <Image
        src={partner.logo.src}
        width={width}
        height={height}
        alt={decorative ? "" : partner.name}
        loading="lazy"
        sizes={`${width}px`}
        className="max-w-none object-contain opacity-70 transition-[opacity,transform] duration-500 ease-out-expo hover:scale-105 hover:opacity-100"
        style={{ width, height: "auto", maxHeight: height }}
      />
    </li>
  );
}

/** Renders nothing until real partner logos are configured in src/content/site.ts. */
export function Partners({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null;

  const repeats = Math.max(1, Math.ceil(MIN_PER_HALF / partners.length));
  const half = Array.from({ length: repeats }, () => partners).flat();

  return (
    <section aria-labelledby="partners-heading" className="border-t border-line pt-16 pb-20 md:pt-24 md:pb-28">
      <div data-reveal className="container-edge flex items-end justify-between gap-6">
        <h2 id="partners-heading" className="wdth-wide text-[clamp(1.75rem,3.6vw,3.25rem)] font-[680] leading-none tracking-[-0.035em] text-bone">
          Partnering with
        </h2>
        <span className="text-label shrink-0 pb-1 text-ash">({String(partners.length).padStart(2, "0")})</span>
      </div>

      <div
        data-reveal
        className="marquee group relative mt-12 overflow-hidden border-y border-line py-10 md:mt-16 md:py-14"
        style={{ "--marquee-duration": `${half.length * 4}s` } as React.CSSProperties}
      >
        <ul className="marquee-track flex w-max items-center">
          {half.map((p, i) => (
            <Logo key={`a-${i}`} partner={p} decorative={i >= partners.length} />
          ))}
          {half.map((p, i) => (
            <Logo key={`b-${i}`} partner={p} decorative />
          ))}
        </ul>
      </div>
    </section>
  );
}
