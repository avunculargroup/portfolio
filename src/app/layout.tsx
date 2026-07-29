import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE } from "@/lib/config";
import "./globals.css";

/*
 * Fonts are self-hosted by next/font at build time — no runtime request to
 * fonts.googleapis.com. This is required by the spec (§1) and also removes a
 * class of blank-render bugs (CLAUDE.md → design).
 */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-display",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-mono",
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
    "AI Delivery Lead",
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
  themeColor: "#F3F4F6",
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
      className={`${display.variable} ${serif.variable} ${mono.variable}`}
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
