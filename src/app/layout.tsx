import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";

import { ContactFooter } from "@/components/layout/ContactFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { copy, site } from "@/content/site";
import { getLogo } from "@/lib/assets";

import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: site.company.displayName,
    template: `%s | ${site.company.displayName}`,
  },
  description: copy.hero.description,
  applicationName: site.company.displayName,
  openGraph: {
    type: "website",
    siteName: site.company.displayName,
    title: site.company.displayName,
    description: copy.hero.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f0",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrument.variable} ${plexMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-paper text-fg">
        <SiteHeader logo={getLogo()} />
        <main id="main" tabIndex={-1} className="flex-1 focus-visible:outline-none">
          {children}
        </main>
        <ContactFooter />
      </body>
    </html>
  );
}
