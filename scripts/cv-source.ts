/**
 * Shared by generate-cv-pdf.ts and check-cv.ts.
 *
 * The source hash is stamped into the PDF's Keywords when it is generated, and
 * compared on check — so a PDF built from an older lib/cv.ts is caught rather
 * than quietly served. It covers the content, not the styling: after a CSS
 * change, regenerate by hand.
 */
import { createHash } from "node:crypto";
import { PDFDict, PDFName, type PDFDocument } from "pdf-lib";
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

/**
 * Names of any Type 3 fonts in the PDF. Chrome embeds variable fonts as
 * Type 3, which some applicant tracking systems parse badly; /cv/print loads
 * static fonts (scripts/build-cv-print-fonts.py) so this should be empty.
 */
export function type3Fonts(doc: PDFDocument): string[] {
  const found = new Set<string>();
  for (const [, object] of doc.context.enumerateIndirectObjects()) {
    if (!(object instanceof PDFDict)) continue;
    if (object.get(PDFName.of("Type")) !== PDFName.of("Font")) continue;
    if (object.get(PDFName.of("Subtype")) !== PDFName.of("Type3")) continue;
    const descriptor = object.lookupMaybe(PDFName.of("FontDescriptor"), PDFDict);
    const name =
      object.get(PDFName.of("BaseFont")) ??
      object.get(PDFName.of("Name")) ??
      descriptor?.get(PDFName.of("FontName"));
    found.add(name ? name.toString().replace(/^\//, "") : "(unnamed)");
  }
  return [...found];
}
