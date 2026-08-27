import { PLACEHOLDER_MODE } from "@/lib/placeholder";
import styles from "./placeholder-banner.module.css";

/**
 * Fixed warning bar for the placeholder-content pass. Renders only when
 * NEXT_PUBLIC_PLACEHOLDER_MODE === "true"; returns null otherwise, so it
 * costs nothing in a normal build.
 *
 * The offset it needs is carried by `--placeholder-bar-h` in globals.css,
 * which is 0px unless `<html data-placeholder="true">` is set in layout.tsx.
 */
export function PlaceholderBanner() {
  if (!PLACEHOLDER_MODE) return null;

  return (
    <div className={styles.bar} role="alert">
      <span className={styles.stripe} aria-hidden="true" />
      Placeholder content — not for deploy
      <span className={styles.stripe} aria-hidden="true" />
    </div>
  );
}
