/**
 * CV guard. Run:  npm run cv:check   (also part of `npm run verify`)
 *
 * 1. Source: lib/cv.ts must not say things that have already been corrected
 *    elsewhere (the corpus, LinkedIn), and must not carry a phone number.
 * 2. Links: every "Ask the agent" query must have a retrieval eval.
 * 3. PDF: public/cv/chris-pollard-cv.pdf must exist, be two A4 pages under
 *    500 KB, embed no Type 3 fonts, and have been generated from the current
 *    lib/cv.ts.
 *
 * No API key or running server needed.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import { CV_ASK_PROMPTS } from "../src/lib/config";
import { CV } from "../src/lib/cv";
import {
  CV_PDF_FILE,
  CV_PDF_MAX_BYTES,
  CV_PDF_PAGES,
  HASH_PREFIX,
  cvSourceHash,
  type3Fonts,
} from "./cv-source";

const problems: string[] = [];
const text = JSON.stringify(CV);

/* 1. Source ---------------------------------------------------------------- */

const FORBIDDEN: { pattern: RegExp; why: string }[] = [
  {
    pattern: /(\+61|\b04\d{2}[\s-]?\d{3}[\s-]?\d{3}\b)/,
    why: "phone number — the public CV carries email only",
  },
  {
    pattern: /\bANZ\b/,
    why: "Juvare's clients were Australian only, not ANZ",
  },
  {
    pattern: /\bDirector\b/,
    why: "BTS title is Co-founder & Principal Engineer",
  },
  {
    pattern: /\bevals?\b[^.;]*\bgated?\b/i,
    why: "LLM evals run on demand; only the deterministic suites are CI-gated",
  },
  {
    // Assembled so this file can't trip the placeholder build check.
    pattern: new RegExp("\\{\\{" + "FAKE:"),
    why: "placeholder marker",
  },
];

for (const { pattern, why } of FORBIDDEN) {
  const match = text.match(pattern);
  if (match) problems.push(`lib/cv.ts contains "${match[0]}": ${why}.`);
}

if (/PRINCE2/.test(text) && !/PRINCE2[^"]*lapsed/.test(text)) {
  problems.push("lib/cv.ts mentions PRINCE2 without saying it has lapsed.");
}

const juvare = CV.roles.find((role) => role.org === "Juvare");
if (!juvare || juvare.to !== "May 2026") {
  problems.push("Juvare must end May 2026.");
}

/* 2. Ask links have evals -------------------------------------------------- */

const evalSource = readFileSync("scripts/eval.ts", "utf8");
for (const [id, query] of Object.entries(CV_ASK_PROMPTS)) {
  if (!evalSource.includes(query)) {
    problems.push(
      `CV_ASK_PROMPTS["${id}"] has no retrieval eval in scripts/eval.ts ("${query}").`,
    );
  }
}

/* 3. The PDF --------------------------------------------------------------- */

async function checkPdf() {
  if (!existsSync(CV_PDF_FILE)) {
    problems.push(`${CV_PDF_FILE} is missing. Run npm run cv:pdf.`);
    return;
  }

  const bytes = statSync(CV_PDF_FILE).size;
  if (bytes > CV_PDF_MAX_BYTES) {
    problems.push(`${CV_PDF_FILE} is ${Math.round(bytes / 1000)} KB (limit ${CV_PDF_MAX_BYTES / 1000} KB).`);
  }

  const doc = await PDFDocument.load(readFileSync(CV_PDF_FILE), {
    updateMetadata: false,
  });

  const pages = doc.getPages();
  if (pages.length !== CV_PDF_PAGES) {
    problems.push(`${CV_PDF_FILE} has ${pages.length} pages, expected ${CV_PDF_PAGES}.`);
  }
  for (const [i, page] of pages.entries()) {
    const { width, height } = page.getSize();
    // A4 is 595.28 × 841.89 pt; allow rounding.
    if (Math.abs(width - 595.3) > 2 || Math.abs(height - 841.9) > 2) {
      problems.push(`page ${i + 1} is ${Math.round(width)}×${Math.round(height)} pt, not A4.`);
    }
  }

  const type3 = type3Fonts(doc);
  if (type3.length) {
    problems.push(
      `${CV_PDF_FILE} embeds Type 3 fonts (${type3.join(", ")}), which some applicant tracking systems parse badly. /cv/print should load the static fonts; regenerate with npm run cv:pdf.`,
    );
  }

  const expected = `${HASH_PREFIX}${cvSourceHash()}`;
  const keywords = doc.getKeywords() ?? "";
  if (!keywords.includes(expected)) {
    problems.push(
      `${CV_PDF_FILE} was generated from an older lib/cv.ts. Run npm run cv:pdf and commit it.`,
    );
  }
}

async function main() {
  await checkPdf();

  if (problems.length) {
    console.error(`✗ cv:check — ${problems.length} problem${problems.length === 1 ? "" : "s"}:`);
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  console.log("✓ cv:check — CV source, ask-link evals and PDF all in order.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
