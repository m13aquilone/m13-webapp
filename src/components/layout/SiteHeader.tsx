"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { navigation, type ImageAsset } from "@/content/site";

import { Wordmark } from "./Wordmark";

type Props = {
  logo?: ImageAsset & { alt: string };
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader({ logo }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    // `data-scrolling` on <html> while the page moves; idle float effects pause on it.
    const root = document.documentElement;
    let idle = 0;
    const update = () => setScrolled(window.scrollY > 24);
    const onScroll = () => {
      update();
      root.dataset.scrolling = "";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => delete root.dataset.scrolling, 200);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(idle);
      delete root.dataset.scrolling;
    };
  }, []);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = [toggle, ...focusables()].filter(Boolean) as HTMLElement[];
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) close(false);
    };

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ${
        open
          ? "border-b border-line bg-paper"
          : scrolled
            ? "border-b border-line bg-paper/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
      }`}
    >
      <a
        href="#main"
        className="text-label absolute left-4 top-3 -translate-y-24 bg-fg px-3 py-2 text-paper focus-visible:translate-y-0"
      >
        Skip to content
      </a>

      <div className="container-edge flex h-[4.5rem] items-center justify-between">
        <Link href="/" className="relative z-10 -m-2 p-2" aria-label={logo ? undefined : "M13 Aquilone, home"}>
          <Wordmark logo={logo} />
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-10">
            {navigation.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`text-label group relative inline-block py-2 transition-colors duration-300 ${
                      active ? "text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-current transition-transform duration-500 ease-out-expo ${
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
            <li>
              <a
                href="#contact"
                className="text-label group inline-flex items-center gap-3 border border-line-strong px-4 py-3 text-fg transition-colors duration-300 hover:border-cyan"
              >
                Get in touch
                <span
                  aria-hidden
                  className="h-px w-5 bg-olive transition-all duration-500 ease-out-expo group-hover:w-8 group-hover:bg-cyan"
                />
              </a>
            </li>
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="text-label relative z-10 -mr-2 inline-flex items-center gap-3 p-2 text-fg md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          <span>{open ? "Close" : "Menu"}</span>
          <span aria-hidden className="relative block h-3 w-6">
            <span
              className={`absolute left-0 top-0 h-px w-full bg-fg transition-transform duration-500 ease-out-expo ${
                open ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute bottom-0 left-0 h-px bg-fg transition-all duration-500 ease-out-expo ${
                open ? "w-full -translate-y-[5px] -rotate-45" : "w-2/3"
              }`}
            />
          </span>
        </button>
      </div>

      <div
        id={menuId}
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[4.5rem] overflow-y-auto border-t border-line bg-paper md:hidden"
      >
        <nav aria-label="Mobile" className="container-edge flex min-h-full flex-col pb-10 pt-8">
          <ul className="flex flex-col">
            {navigation.map((item, i) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline justify-between py-6"
                  >
                    <span
                      className={`wdth-wide text-[2.75rem] font-[650] leading-none tracking-[-0.04em] ${
                        active ? "text-fg" : "text-fg/70"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="text-label text-muted">{active ? "Current" : `0${i + 1}`}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="text-label mt-auto inline-flex items-center justify-between border border-line-strong px-5 py-5 text-fg"
          >
            Get in touch
            <span aria-hidden className="h-px w-10 bg-olive" />
          </a>
        </nav>
      </div>
    </header>
  );
}
