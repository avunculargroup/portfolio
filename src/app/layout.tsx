import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SITE } from "@/lib/config";
import { PLACEHOLDER_MODE } from "@/lib/placeholder";
import "./globals.css";

/*
 * Fonts are self-hosted — no runtime request to fonts.googleapis.com, which
 * removes a class of blank-render bugs (CLAUDE.md → design).
 *
 * The woff2 files are vendored in ./fonts and loaded with next/font/local
 * rather than next/font/google, so the *build* has no network dependency
 * either: next/font/google fetches from fonts.gstatic.com at build time, and
 * a gstatic blip there fails the whole deploy.
 *
 * These are the latin-subset variable files (one per style), matching the
 * previous `subsets: ["latin"]`. To refresh them, pull the `latin` @font-face
 * srcs from the Google Fonts css2 API — Newsreader `opsz 6..72, wght 400..600`
 * (normal + italic) and Manrope `wght 400..800` — and drop the woff2 in place.
 */
const newsreader = localFont({
  src: [
    {
      path: "./fonts/newsreader-latin-var.woff2",
      weight: "400 600",
      style: "normal",
    },
    {
      path: "./fonts/newsreader-latin-italic-var.woff2",
      weight: "400 600",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--font-serif",
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});

const manrope = localFont({
  src: [
    {
      path: "./fonts/manrope-latin-var.woff2",
      weight: "400 800",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-sans",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.linkedin }],
  creator: SITE.name,
  keywords: [
    "Technical Product Lead AI",
    "LLM engineer",
    "agent engineering",
    "RAG",
    "TypeScript",
    "Next.js",
    "Melbourne",
    "Chris Pollard",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    locale: "en_AU",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF8F3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${manrope.variable}`}
      /* Placeholder pass: drives --placeholder-bar-h in globals.css, which
         offsets the body and the sticky header under the warning banner.
         Undefined (and so inert) in a normal build. */
      data-placeholder={PLACEHOLDER_MODE ? "true" : undefined}
    >
      <body>
        <a className="skipLink" href="#main">
          Skip to content
        </a>
        {children}
        {/* Cookieless, no PII, no cross-site tracking (spec §9). Only mounted on
            Vercel, where the script is actually served — elsewhere it would 404
            on every page load. */}
        {process.env.VERCEL_ENV ? <Analytics /> : null}
      </body>
    </html>
  );
}
