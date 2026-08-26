#!/usr/bin/env node
/**
 * Placeholder guard (August 2026 content pass).
 *
 * Scans the Next build output for the fabricated-content marker. Wired into
 * `npm run build` after `next build`.
 *
 * Two tiers, because the placeholder branch is deliberately deployed to a
 * Vercel PREVIEW while the real copy is being written:
 *
 *   - VERCEL_ENV === "production"  → always fails. No opt-in, no override.
 *     chrispollard.com.au cannot be built while markers are present, however
 *     the build was triggered — a promote, a merge, a manual redeploy.
 *   - anything else → fails, unless ALLOW_PLACEHOLDER_BUILD === "true", in
 *     which case it warns loudly and passes. That opt-in lives in the
 *     committed .env.production on the placeholder branch only, so it cannot
 *     reach main without showing up in the diff.
 *
 * The marker is assembled from parts below so that this file, and any bundle
 * that ever inlined it, cannot itself trip the check.
 *
 * Delete this script (and its `build` hook) when the placeholder pass is over.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

/**
 * Next loads .env files into its own process; this script is a separate node
 * process, so the opt-in has to be read off disk. Deliberately minimal: bare
 * KEY=value lines, no quoting rules, no interpolation, no dependency.
 */
function readEnvFile(name) {
  const path = join(ROOT, name);
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

/** Process env wins; the committed .env.production is the fallback. */
function optedIn() {
  if (process.env.ALLOW_PLACEHOLDER_BUILD !== undefined) {
    return process.env.ALLOW_PLACEHOLDER_BUILD === "true";
  }
  return readEnvFile(".env.production").ALLOW_PLACEHOLDER_BUILD === "true";
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
  const isProduction = process.env.VERCEL_ENV === "production";
  const allowed = !isProduction && optedIn();
  const log = allowed ? console.warn : console.error;

  log(
    allowed
      ? `\n⚠ PLACEHOLDER CONTENT IN BUILD OUTPUT — allowed on this build only.\n`
      : `\n✗ PLACEHOLDER CONTENT IN BUILD OUTPUT — refusing to complete the build.\n`,
  );
  log(
    `  ${total} ${MARKER} marker${total === 1 ? "" : "s"} across ${hits.length} build file${hits.length === 1 ? "" : "s"}:\n`,
  );
  for (const hit of hits.slice(0, 12)) {
    log(`  ${hit.file}  (${hit.occurrences})`);
    log(`    ${hit.excerpt}…\n`);
  }
  if (hits.length > 12) {
    log(`  …and ${hits.length - 12} more build files.\n`);
  }
  log(`  Find them in source with:  git grep -n '${MARKER}' -- src scripts\n`);

  if (allowed) {
    log(
      `  Allowed by ALLOW_PLACEHOLDER_BUILD=true (VERCEL_ENV=${
        process.env.VERCEL_ENV ?? "unset"
      }).\n  This deployment carries fabricated copy and is served noindex.\n` +
        `  A production build fails here regardless of that flag.\n`,
    );
    return;
  }

  if (isProduction) {
    log(
      `  This is a PRODUCTION build. ALLOW_PLACEHOLDER_BUILD cannot override it.\n`,
    );
  }

  process.exit(1);
}

main();
