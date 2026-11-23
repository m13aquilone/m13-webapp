import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section aria-labelledby="not-found-heading" className="wash-cyan flex flex-1 items-end pb-24 pt-36 md:pb-40 md:pt-48">
      <div className="container-edge">
        <p className="text-label flex items-center gap-4 text-muted">
          <span aria-hidden className="h-px w-10 bg-olive" />
          404
        </p>
        <h1 id="not-found-heading" className="wdth-expanded text-display mt-8 font-[760] text-fg">
          Page not <span className="text-gradient font-serif font-normal italic">found</span>
        </h1>
        <Link
          href="/"
          className="text-label group mt-12 inline-flex items-center gap-4 rounded-full border border-line-strong px-7 py-4 text-fg transition-colors duration-300 hover:border-olive hover:bg-olive hover:text-paper"
        >
          Back to home
          <span aria-hidden className="h-px w-6 bg-current transition-[width] duration-500 ease-smooth group-hover:w-10" />
        </Link>
      </div>
    </section>
  );
}
