import Link from "next/link";

import { navigation, site } from "@/content/site";

import { CopyrightYear } from "./CopyrightYear";

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function whatsappHref(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43a9.4 9.4 0 0 1 6.67 2.77 9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43m8.02-17.45A11.27 11.27 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.62l6.02-1.58a11.33 11.33 0 0 0 5.43 1.38h.01c6.25 0 11.34-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.02" />
    </svg>
  );
}

const linkClass = "group inline-flex items-center gap-3 text-fg transition-colors hover:text-cyan";
const iconClass =
  "flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-line transition-[scale,background-color,color] duration-300 group-hover:scale-110";

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </svg>
  );
}

export function ContactFooter() {
  const { legalName, address, phone, email, whatsappMessage } = site.company;
  const whatsapp = site.company.whatsapp === false ? undefined : (site.company.whatsapp ?? phone);

  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="theme-olive relative scroll-mt-20 overflow-hidden bg-paper"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20vw] -top-[30vw] h-[70vw] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgb(0_194_209/0.14),transparent)]"
      />

      <div className="container-edge relative pb-10 pt-24 md:pt-36">
        <div className="flex items-center gap-4">
          <span className="text-label text-muted">Contact</span>
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>

        <h2 id="contact-heading" className="wdth-expanded text-display mt-10 font-[750] text-fg md:mt-14">
          Contact{" "}
          <span className="font-serif font-normal italic tracking-[-0.02em] [font-stretch:100%] [font-variation-settings:normal]">
            us
          </span>
        </h2>

        <div className="mt-16 grid gap-14 md:mt-24 md:grid-cols-12 md:gap-8">
          <address className="not-italic md:col-span-5">
            <p className="text-label text-muted">Registered office</p>
            <p className="wdth-wide mt-5 text-lg font-[650] tracking-[-0.01em] text-fg">{legalName}</p>
            <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
              {address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>

            {(phone || email || whatsapp) && (
              <div className="mt-6 space-y-2.5 text-base md:text-lg">
                {(phone || whatsapp) && (
                  <p className="flex items-center gap-3">
                    {phone && (
                      <a href={telHref(phone)} className={linkClass}>
                        <span className={`${iconClass} group-hover:bg-cyan group-hover:text-paper`}>
                          <PhoneIcon className="size-4" />
                        </span>
                        {phone}
                      </a>
                    )}
                    {whatsapp && (
                      <a
                        href={whatsappHref(whatsapp, whatsappMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Chat on WhatsApp"
                        title="Chat on WhatsApp"
                        className="flex size-8 items-center justify-center rounded-full text-[#25d366] ring-1 ring-line transition-[scale,background-color,color] duration-300 hover:scale-110 hover:bg-[#25d366] hover:text-white"
                      >
                        <WhatsAppIcon className="size-[1.1rem]" />
                      </a>
                    )}
                  </p>
                )}
                {email && (
                  <p>
                    <a href={`mailto:${email}`} className={linkClass}>
                      <span className={`${iconClass} group-hover:bg-cyan group-hover:text-paper`}>
                        <MailIcon className="size-4" />
                      </span>
                      {email}
                    </a>
                  </p>
                )}
              </div>
            )}
          </address>

          <nav aria-label="Footer" className="md:col-span-4 md:col-start-9">
            <p className="text-label text-muted">Pages</p>
            <ul className="mt-5 border-t border-line">
              {navigation.map((item) => (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between py-4 text-lg text-fg transition-colors"
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

        <div className="mt-24 flex flex-col gap-3 border-t border-line pt-6 text-muted sm:flex-row sm:items-center sm:justify-between md:mt-32">
          <p className="text-label">
            &copy; <CopyrightYear /> {legalName}
          </p>
          <p className="text-label">Thiruvananthapuram, Kerala</p>
        </div>
      </div>
    </footer>
  );
}
