import Link from "next/link";

import { navigation, site } from "@/content/site";

import { CopyrightYear } from "./CopyrightYear";

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function ContactFooter() {
  const { legalName, address, phone, email } = site.company;
  const contactRows = [
    phone ? { label: "Phone", value: phone, href: telHref(phone) } : null,
    email ? { label: "Email", value: email, href: `mailto:${email}` } : null,
  ].filter((row): row is { label: string; value: string; href: string } => row !== null);

  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="relative scroll-mt-20 overflow-hidden border-t border-line bg-ink"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20vw] -top-[30vw] h-[70vw] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgb(75_83_32/0.35),transparent)]"
      />

      <div className="container-edge relative pb-10 pt-24 md:pt-36">
        <div className="flex items-center gap-4">
          <span className="text-label text-ash">Contact</span>
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>

        <h2
          id="contact-heading"
          className="wdth-expanded text-display mt-10 font-[750] text-bone md:mt-14"
        >
          Contact <span className="font-serif font-normal italic tracking-[-0.02em] [font-stretch:100%] [font-variation-settings:normal]">us</span>
        </h2>

        <div className="mt-16 grid gap-14 md:mt-24 md:grid-cols-12 md:gap-8">
          <address className="not-italic md:col-span-5">
            <p className="text-label text-ash">Registered office</p>
            <p className="wdth-wide mt-5 text-lg font-[650] tracking-[-0.01em] text-bone">
              {legalName}
            </p>
            <p className="mt-4 text-base leading-relaxed text-ash md:text-lg">
              {address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>

            {contactRows.length > 0 && (
              <dl className="mt-10 border-t border-line">
                {contactRows.map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                    <dt className="text-label text-ash">{row.label}</dt>
                    <dd>
                      <a
                        href={row.href}
                        className="text-base text-bone underline decoration-olive decoration-1 underline-offset-[6px] transition-colors hover:decoration-cyan md:text-lg"
                      >
                        {row.value}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </address>

          <nav aria-label="Footer" className="md:col-span-4 md:col-start-9">
            <p className="text-label text-ash">Pages</p>
            <ul className="mt-5 border-t border-line">
              {navigation.map((item) => (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between py-4 text-lg text-bone transition-colors"
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className="h-px w-6 bg-line-strong transition-all duration-500 ease-out-expo group-hover:w-12 group-hover:bg-cyan"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-24 flex flex-col gap-3 border-t border-line pt-6 text-ash sm:flex-row sm:items-center sm:justify-between md:mt-32">
          <p className="text-label">
            &copy; <CopyrightYear /> {legalName}
          </p>
          <p className="text-label">Thiruvananthapuram, Kerala</p>
        </div>
      </div>
    </footer>
  );
}
