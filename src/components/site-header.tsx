"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SITE } from "@/lib/config";
import styles from "./site-header.module.css";

const NAV_LINKS = [
  { href: "#ask", label: "Ask" },
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  /** Only pull focus back to the button when *we* closed the menu. */
  const shouldRestoreFocus = useRef(false);

  const close = useCallback((restoreFocus: boolean) => {
    shouldRestoreFocus.current = restoreFocus;
    setOpen(false);
  }, []);

  // Escape closes and returns focus to the toggle.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Outside click/tap closes without stealing focus.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (headerRef.current?.contains(target)) return;
      close(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  // Lock body scroll only while the panel is open, and compensate for the
  // scrollbar so the page doesn't shift sideways underneath it.
  useEffect(() => {
    if (!open) return;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [open]);

  // Move focus to the first item on open; return it to the button on close.
  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    } else if (shouldRestoreFocus.current) {
      shouldRestoreFocus.current = false;
      buttonRef.current?.focus();
    }
  }, [open]);

  // If the viewport grows past the mobile breakpoint while the panel is open,
  // the panel is hidden by CSS — drop the state (and the scroll lock) with it.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia("(min-width: 768px)");
    function onChange(event: MediaQueryListEvent) {
      if (event.matches) close(false);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open, close]);

  return (
    <header ref={headerRef} className={styles.bar}>
      <div className={`wrap ${styles.inner}`}>
        <span className={styles.mark} aria-hidden="true">
          CP
        </span>

        <span className={styles.who}>
          {SITE.name}
          <span className={styles.role}>{SITE.role} · Melbourne</span>
        </span>

        <span className={styles.spacer} />

        <span className={styles.tag}>Live agent</span>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
          <a href="#contact" className={styles.sayHi}>
            Say hi
          </a>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => (open ? close(true) : setOpen(true))}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {open && (
        <div ref={panelRef} id={panelId} className={styles.panel}>
          <nav aria-label="Menu">
            <ul className={styles.panelList}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={styles.panelLink}
                    onClick={() => close(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  className={styles.panelLink}
                  onClick={() => close(false)}
                >
                  Say hi
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
