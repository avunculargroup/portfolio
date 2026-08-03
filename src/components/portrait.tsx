"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.css";

/**
 * Renders /public/portrait.jpg if present. Falls back to a monogram card
 * rather than a broken-image icon — the site must stand alone even without a
 * photo asset in place (CLAUDE.md non-negotiable §5).
 *
 * A same-origin 404 for a local file often resolves before React finishes
 * hydrating and attaching its onError listener, so the natural error event
 * can be missed. Checking `img.complete`/`naturalWidth` on mount catches
 * that race; onError remains as a backstop for failures that happen later.
 */
export function Portrait() {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  return (
    <div className={styles.portraitWrap}>
      <div className={styles.portraitBacking} aria-hidden="true" />
      {failed ? (
        <div className={styles.portrait} role="img" aria-label="Chris Pollard">
          <span className={styles.portraitMonogram} aria-hidden="true">
            CP
          </span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src="/portrait.jpg"
          alt="Chris Pollard"
          className={styles.portrait}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
