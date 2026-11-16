/**
 * Shared by generate-cv-pdf.ts and check-cv.ts.
 *
 * The source hash is stamped into the PDF's Keywords when it is generated, and
 * compared on check — so a PDF built from an older lib/cv.ts is caught rather
 * than quietly served. It covers the content, not the styling: after a CSS
 * change, regenerate by hand.
 */
import { createHash } from "node:crypto";
import { CV, CV_UPDATED, PRINT_BREAK_BEFORE } from "../src/lib/cv";

export const CV_PDF_FILE = "public/cv/chris-pollard-cv.pdf";
export const CV_PDF_MAX_BYTES = 500_000;
export const CV_PDF_PAGES = 2;
export const HASH_PREFIX = "cv-source:";

export function cvSourceHash(): string {
  return createHash("sha256")
    .update(JSON.stringify({ CV, CV_UPDATED, PRINT_BREAK_BEFORE }))
    .digest("hex")
    .slice(0, 16);
}
