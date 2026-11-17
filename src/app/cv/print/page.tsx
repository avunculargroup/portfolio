import type { Metadata } from "next";
import localFont from "next/font/local";
import { CvDocument } from "@/components/cv-document";
import { SITE } from "@/lib/config";

/*
 * The page scripts/generate-cv-pdf.ts prints to A4. Not for visitors: no
 * header or nav, noindex, and disallowed in robots.ts. Margins and the footer
 * line come from the generator (page.pdf), not from CSS @page, so the two
 * can't disagree.
 */
export const metadata: Metadata = {
  // Becomes the PDF's document title.
  title: { absolute: `${SITE.name} — CV` },
  robots: { index: false, follow: false },
};

/*
 * Static, fixed-weight fonts for print only. Chrome embeds the site's
 * variable fonts as Type 3, which some applicant tracking systems parse
 * badly; these embed as ordinary TrueType. Same faces, same weights, so the
 * PDF looks the same. Built by scripts/build-cv-print-fonts.py.
 *
 * Their CSS variables override the site-wide --font-sans / --font-serif for
 * everything inside <main>, which is all the CV document reads.
 */
const printSans = localFont({
  src: [
    { path: "./fonts/manrope-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/manrope-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/manrope-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/manrope-700.woff2", weight: "700", style: "normal" },
  ],
  display: "block",
  variable: "--font-sans",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

const printSerif = localFont({
  src: [
    { path: "./fonts/newsreader-text-400.woff2", weight: "400", style: "normal" },
    // The 32pt name: optical size for display.
    { path: "./fonts/newsreader-display-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/newsreader-text-600.woff2", weight: "600", style: "normal" },
  ],
  display: "block",
  variable: "--font-serif",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export default function CvPrintPage() {
  return (
    <>
      {/* White paper for the PDF (the site's warm --paper stays on screen),
          and no placeholder-banner offset if the build has one switched on. */}
      <style>{"html,body{background:#fff}body{padding-top:0!important}"}</style>
      <main id="main" className={`${printSans.variable} ${printSerif.variable}`}>
        <CvDocument mode="print" />
      </main>
    </>
  );
}
