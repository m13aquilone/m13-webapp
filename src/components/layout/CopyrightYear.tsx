"use client";

/** Rendered at build time, then corrected in the browser so the year stays current between deploys. */
export function CopyrightYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
