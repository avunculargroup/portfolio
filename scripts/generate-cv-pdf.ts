/**
 * Generates public/cv/chris-pollard-cv.pdf from /cv/print.
 *
 *   npm run build && npm run start     # or npm run dev, in another terminal
 *   npm run cv:pdf                     # then commit the PDF
 *
 * Why print the site rather than export from a design tool: Chrome's print
 * engine writes real, selectable text with embedded fonts, so applicant
 * tracking systems read the actual words. The design-tool export (November
 * 2026) was a page image with an OCR text layer: 2.6 MB, and OCR-merged words
 * like "end-toend".
 *
 * Fails, and writes nothing, if the result isn't exactly two A4 pages under
 * 500 KB, or if any font is embedded as Type 3 (see build-cv-print-fonts.py). Fix the copy in lib/cv.ts or PRINT_BREAK_BEFORE, not the check.
 *
 * Env:
 *   CV_BASE_URL               default http://localhost:3000
 *   PLAYWRIGHT_CHROMIUM_PATH  optional, a specific Chromium binary
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";
import { CV, CV_UPDATED } from "../src/lib/cv";
import {
  CV_PDF_FILE,
  CV_PDF_MAX_BYTES,
  CV_PDF_PAGES,
  HASH_PREFIX,
  cvSourceHash,
  type3Fonts,
} from "./cv-source";

const BASE = (process.env.CV_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const URL = `${BASE}/cv/print`;

/* Page margins. The footer sits inside the bottom margin. */
const MARGIN = { top: "15mm", right: "16mm", bottom: "17mm", left: "16mm" };

/* Chrome renders header/footer templates in isolation: no page CSS, no web
   fonts, so this uses a system sans and inline styles only. */
const FOOTER = `
<div style="width:100%;padding:0 16mm;display:flex;justify-content:space-between;
  font-family:Helvetica,Arial,sans-serif;font-size:7.5pt;color:#6b625b;">
  <span>${CV.name} — CV · Updated ${CV_UPDATED} · chrispollard.com.au</span>
  <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`;

function fail(message: string): never {
  console.error(`✗ cv:pdf — ${message}`);
  process.exit(1);
}

async function main() {
  try {
    const response = await fetch(URL);
    if (!response.ok) fail(`${URL} returned ${response.status}.`);
  } catch {
    fail(
      `can't reach ${URL}. Start the site first (npm run build && npm run start, or npm run dev), or set CV_BASE_URL.`,
    );
  }

  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  });

  let pdf: Uint8Array;
  try {
    const page = await browser.newPage();
    await page.emulateMedia({ media: "print" });
    await page.goto(URL, { waitUntil: "networkidle" });
    // Self-hosted fonts (next/font/local) must be in before printing, or the
    // PDF embeds the fallback face.
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      // Tagged PDF: headings and reading order for screen readers.
      tagged: true,
      margin: MARGIN,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: FOOTER,
    });
  } finally {
    await browser.close();
  }

  // Document properties + the source hash check-cv.ts compares against.
  const doc = await PDFDocument.load(pdf);
  const pages = doc.getPageCount();
  if (pages !== CV_PDF_PAGES) {
    fail(
      `got ${pages} pages, expected ${CV_PDF_PAGES}. Trim copy in src/lib/cv.ts or move PRINT_BREAK_BEFORE, then re-run.`,
    );
  }

  const type3 = type3Fonts(doc);
  if (type3.length) {
    fail(
      `fonts embedded as Type 3 (${type3.join(", ")}). /cv/print must load the static fonts in src/app/cv/print/fonts; see scripts/build-cv-print-fonts.py.`,
    );
  }

  const hash = cvSourceHash();
  doc.setTitle(`${CV.name} — CV`);
  doc.setAuthor(CV.name);
  doc.setSubject(`${CV.role}. Updated ${CV_UPDATED}.`);
  doc.setKeywords([CV.role, "CV", `${HASH_PREFIX}${hash}`]);
  doc.setCreator("chrispollard.com.au/cv");
  doc.setLanguage("en-AU");
  const bytes = await doc.save();

  if (bytes.byteLength > CV_PDF_MAX_BYTES) {
    fail(
      `PDF is ${Math.round(bytes.byteLength / 1000)} KB, over the ${CV_PDF_MAX_BYTES / 1000} KB limit.`,
    );
  }

  mkdirSync(dirname(CV_PDF_FILE), { recursive: true });
  writeFileSync(CV_PDF_FILE, bytes);
  console.log(
    `✓ cv:pdf — wrote ${CV_PDF_FILE} (${pages} pages, ${Math.round(bytes.byteLength / 1000)} KB, source ${hash}). Commit it.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
