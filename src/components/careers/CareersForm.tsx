"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const fieldClass =
  "mt-3 w-full border-0 border-b border-line-strong bg-transparent px-0 py-3 text-lg text-fg outline-none transition-colors placeholder:text-muted/60 focus:border-olive";

/**
 * Posts the application to a Google Apps Script web app, which appends it as a
 * row in a Google Sheet (see google-apps-script/careers.gs).
 */
export function CareersForm({ endpoint }: { endpoint: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: new URLSearchParams(new FormData(form) as unknown as Record<string, string>),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !data?.ok) throw new Error("Submission failed");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="border-t border-line pt-10">
        <span aria-hidden className="block h-px w-10 bg-gradient-to-r from-olive to-cyan" />
        <p className="mt-6 font-serif text-[clamp(2rem,3.6vw,3.25rem)] italic leading-[1.05] tracking-[-0.02em] text-fg">
          Thank you. We have received your details.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-label mt-8 text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form onSubmit={onSubmit} className="grid gap-10 md:grid-cols-2 md:gap-x-8">
      <label className="block md:col-span-2">
        <span className="text-label text-muted">Name</span>
        <input name="name" required maxLength={120} autoComplete="name" className={fieldClass} />
      </label>
      <label className="block">
        <span className="text-label text-muted">Email</span>
        <input name="email" type="email" required maxLength={160} autoComplete="email" className={fieldClass} />
      </label>
      <label className="block">
        <span className="text-label text-muted">Phone</span>
        <input
          name="phone"
          type="tel"
          required
          maxLength={20}
          pattern="[0-9+\(\)\-\s]{7,20}"
          title="Phone number, digits only (+, spaces, dashes allowed)"
          autoComplete="tel"
          inputMode="tel"
          className={fieldClass}
        />
      </label>
      <label className="block md:col-span-2">
        <span className="text-label text-muted">Tell us about you</span>
        <textarea
          name="about"
          required
          rows={6}
          maxLength={3000}
          className={`${fieldClass} resize-y leading-relaxed`}
        />
      </label>

      {/* Honeypot: hidden from people, often filled in by bots. */}
      <label aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="flex flex-wrap items-center gap-6 md:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className="text-label group inline-flex items-center gap-4 rounded-full bg-olive px-8 py-4 text-paper transition-[background-color,opacity] duration-300 hover:bg-fg disabled:opacity-60"
        >
          {sending ? "Sending…" : "Submit"}
          <span
            aria-hidden
            className="h-px w-6 bg-current transition-[width] duration-500 ease-smooth group-hover:w-10"
          />
        </button>
        <p role="status" aria-live="polite" className="text-sm text-muted">
          {status === "error" && "Something went wrong. Please try again in a moment."}
        </p>
      </div>
    </form>
  );
}
