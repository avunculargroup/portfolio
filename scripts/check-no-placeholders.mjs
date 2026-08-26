#!/usr/bin/env node
/**
 * Placeholder guard (August 2026 content pass).
 *
 * Scans the Next build output for the fabricated-content marker and exits
 * non-zero if it finds any. Wired into `npm run build` after `next build`, so
 * a production build — local or on Vercel — physically cannot succeed while
 * placeholder copy is still in the tree.
 *
 * The marker is assembled from parts below so that this file, and any bundle
 * that ever inlined it, cannot itself trip the check.
 *
 * Delete this script (and its `build` hook) when the placeholder pass is over.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const MARKER = "{{" + "FAKE:";
const ROOT = process.cwd();
const BUILD_DIR = join(ROOT, ".next");

/** Compiled output only — caches and source maps would just add noise. */
const SCANNED_EXTENSIONS = [".js", ".mjs", ".cjs", ".html", ".json", ".txt", ".rsc", ".css"];
const SKIPPED_DIRS = new Set(["cache", "trace"]);

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIPPED_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function main() {
  try {
    if (!statSync(BUILD_DIR).isDirectory()) throw new Error("not a directory");
  } catch {
    console.error(
      `✗ placeholder check: no build output at ${relative(ROOT, BUILD_DIR)}${sep} — run this after \`next build\`.`,
    );
    process.exit(1);
  }

  const hits = [];
  let scanned = 0;

  for (const file of walk(BUILD_DIR)) {
    if (!SCANNED_EXTENSIONS.some((ext) => file.endsWith(ext))) continue;
    scanned += 1;
    let contents;
    try {
      contents = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (!contents.includes(MARKER)) continue;

    // Count occurrences and keep one short excerpt, so the failure names a
    // string Chris can actually search for rather than just a filename.
    const occurrences = contents.split(MARKER).length - 1;
    const at = contents.indexOf(MARKER);
    const excerpt = contents
      .slice(at, at + 110)
      .replace(/\s+/g, " ");
    hits.push({ file: relative(ROOT, file), occurrences, excerpt });
  }

  if (hits.length === 0) {
    console.log(
      `✓ placeholder check: no ${MARKER} markers in ${scanned} build files.`,
    );
    return;
  }

  const total = hits.reduce((sum, hit) => sum + hit.occurrences, 0);
  console.error(
    `\n✗ PLACEHOLDER CONTENT IN BUILD OUTPUT — refusing to complete the build.\n`,
  );
  console.error(
    `  ${total} ${MARKER} marker${total === 1 ? "" : "s"} across ${hits.length} build file${hits.length === 1 ? "" : "s"}:\n`,
  );
  for (const hit of hits.slice(0, 12)) {
    console.error(`  ${hit.file}  (${hit.occurrences})`);
    console.error(`    ${hit.excerpt}…\n`);
  }
  if (hits.length > 12) {
    console.error(`  …and ${hits.length - 12} more build files.\n`);
  }
  console.error(
    `  Find them in source with:  git grep -n '${MARKER}' -- src scripts\n`,
  );
  process.exit(1);
}

main();
