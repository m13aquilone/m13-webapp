import Image from "next/image";

import { site, type ImageAsset } from "@/content/site";

type Props = {
  logo?: ImageAsset & { alt: string };
  className?: string;
};

export function Wordmark({ logo, className = "" }: Props) {
  if (logo) {
    const height = 56;
    const width = Math.round((logo.width / logo.height) * height);
    return (
      <Image
        src={logo.src}
        width={width}
        height={height}
        alt={logo.alt}
        preload
        sizes="120px"
        className={`h-11 w-auto md:h-14 ${className}`}
      />
    );
  }

  return (
    <span
      className={`wdth-expanded inline-block text-[1.5rem] leading-none font-[500] tracking-[-0.02em] text-fg ${className}`}
    >
      {site.company.wordmark}
    </span>
  );
}
