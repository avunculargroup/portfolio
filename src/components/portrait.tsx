"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./hero.module.css";

/**
 * Renders /public/portrait.webp if present. Falls back to a monogram card
 * rather than a broken-image icon — the site must stand alone even without a
 * photo asset in place (CLAUDE.md non-negotiable §5).
 *
 * A same-origin 404 for a local file often resolves before React finishes
 * hydrating and attaching its onError listener, so the natural error event
 * can be missed. Checking `img.complete`/`naturalWidth` on mount catches
 * that race; onError remains as a backstop for failures that happen later.
 * This holds for next/image too — it forwards ref/onError to the underlying
 * <img>, and a missing file surfaces as a 400 from the optimizer.
 *
 * width/height are the intrinsic aspect hint only; hero.module.css drives the
 * rendered box (100% wide, ratio-sized beside the greeting below md, fixed
 * height in the desktop right-hand column, object-fit: cover). `priority` is
 * deliberate — this is the hero's LCP candidate, and next/image would
 * otherwise lazy-load it and push LCP out past the Lighthouse budget.
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
        <Image
          ref={imgRef}
          src="/portrait.webp"
          alt="Chris Pollard"
          className={styles.portrait}
          width={1400}
          height={1400}
          sizes="(min-width: 768px) 420px, 40vw"
          priority
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
