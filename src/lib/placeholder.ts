/**
 * Placeholder-content pass (August 2026 repositioning).
 *
 * TEMPORARY. Everything that reads this flag exists so the *shape* of the new
 * product-facing sections can be judged on the page before the real copy is
 * written. None of it is deployable:
 *
 * - Every fabricated string in the codebase is wrapped as `{{FAKE: ...}}`.
 * - `scripts/check-no-placeholders.mjs` greps the build output for that marker
 *   and fails `npm run build`, so a production build cannot ship one.
 * - This flag only controls the *scaffolding* (the banner, the visible slot
 *   labels, the hero variant switcher) — never whether fake copy renders.
 *   Hiding fake copy behind the flag would let a build go green with it still
 *   in the bundle, which is exactly what the marker convention prevents.
 *
 * When the real copy lands: delete this module, the banner, `FactSlot`, the
 * hero variants and the check script, and restore the retired copy preserved
 * in comments alongside each rewritten block.
 */
export const PLACEHOLDER_MODE =
  process.env.NEXT_PUBLIC_PLACEHOLDER_MODE === "true";

/** Height of the fixed banner, mirrored by `--placeholder-bar-h` in globals.css. */
export const PLACEHOLDER_BAR_HEIGHT = "34px";
