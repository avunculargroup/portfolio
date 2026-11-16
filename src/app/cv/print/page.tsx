import type { Metadata } from "next";
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

export default function CvPrintPage() {
  return (
    <>
      {/* White paper for the PDF (the site's warm --paper stays on screen),
          and no placeholder-banner offset if the build has one switched on. */}
      <style>{"html,body{background:#fff}body{padding-top:0!important}"}</style>
      <main id="main">
        <CvDocument mode="print" />
      </main>
    </>
  );
}
