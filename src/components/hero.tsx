import { AVAILABILITY } from "@/lib/config";
import { PLACEHOLDER_MODE } from "@/lib/placeholder";
import { Portrait } from "./portrait";
import styles from "./hero.module.css";

/* ---------------------------------------------------------------------------
   Hero variants (placeholder pass, August 2026).

   Variant 0 is the LIVE copy, unchanged — it is the builder's line the
   repositioning is testing against, kept here rather than deleted so `?hero=0`
   is a true before-shot.

   Variants 1–3 are PLACEHOLDER and marked `{{FAKE: }}`. They are three
   different *claims*, not three phrasings of one:

     1. Judgement   — the value is deciding what not to build.
     2. Translation — the value is owning the commercial case and the code.
     3. Adoption    — the value is that the thing actually gets used.

   Switch with ?hero=1|2|3. Anything else falls back to 0.
   --------------------------------------------------------------------------- */

export const HERO_VARIANTS = [
  {
    id: 0,
    /* Not fabricated — this is the copy currently on the site. */
    name: "Live copy (builder)",
    eyebrow: "Hello, I’m",
    thesis: "I take LLM agents from demo to production.",
    intro:
      "Two years embedded with Australian state government agencies, running requirements and shipping the result. A decade of product and delivery behind it. This site is one of the systems — ask it something real.",
    ctaPrimary: "Ask me something ↓",
    ctaSecondary: "See what I’ve built",
  },
  {
    id: 1,
    name: "Judgement — deciding what not to build",
    eyebrow: "{{FAKE: Hello, I decide}}",
    thesis: "{{FAKE: Most of my value is the features I talk you out of.}}",
    intro:
      "{{FAKE: I cut two thirds of the scope on a platform used by 40,000 applicants a year, and shipped the third that mattered. I can also write the code, which is why the cut was credible. A decade of that behind me.}}",
    ctaPrimary: "{{FAKE: See a decision ↓}}",
    ctaSecondary: "{{FAKE: See what I cut}}",
  },
  {
    id: 2,
    name: "Translation — owns the commercial case and the code",
    eyebrow: "{{FAKE: Hello, I translate}}",
    thesis:
      "{{FAKE: I own the pricing model and the pull request, and I can defend both in the same meeting.}}",
    intro:
      "{{FAKE: I have argued a revenue forecast down from $1,000,000 to $600,000 in front of a board because the model was wrong, then gone back to the branch. Very few people are in both rooms. I am the same person in both.}}",
    ctaPrimary: "{{FAKE: See the commercial call ↓}}",
    ctaSecondary: "{{FAKE: See the codebase}}",
  },
  {
    id: 3,
    name: "Adoption — accountable for whether it gets used",
    eyebrow: "{{FAKE: Hello, I answer for it}}",
    thesis:
      "{{FAKE: Shipping is not the finish line. I am accountable for whether anyone uses the thing.}}",
    intro:
      "{{FAKE: An AI system that gets quietly worked around has failed, however good the retrieval is. I design for the 12 admissions officers and the 3 people on the phones who have to live with it — and I stay attached to it after launch, through the first cycle, when the real verdict arrives.}}",
    ctaPrimary: "{{FAKE: See the first cycle ↓}}",
    ctaSecondary: "{{FAKE: See what happened next}}",
  },
] as const;

/** Parses the `?hero=` search param. Anything unrecognised means the live copy. */
export function parseHeroVariant(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  return HERO_VARIANTS.some((variant) => variant.id === parsed) ? parsed : 0;
}

export function Hero({ variant = 0 }: { variant?: number }) {
  const copy = HERO_VARIANTS.find((v) => v.id === variant) ?? HERO_VARIANTS[0];

  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.grid}`}>
        {/* display:contents below md so the heading, availability, intro and
            CTAs become items of the hero grid and can be placed around the
            portrait; a plain block column from md up (see hero.module.css). */}
        <div className={styles.copy}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h1 className={styles.name}>Chris Pollard.</h1>
          </div>
          {/* Availability sits ahead of the prose deliberately: it's the first
              thing a recruiter needs in order to decide whether to keep
              reading, and it must survive a 320px screen without scrolling. */}
          <p className={styles.availability}>
            <span className={styles.availabilityDot} aria-hidden="true" />
            {AVAILABILITY.full}
          </p>
          {/* The thesis line, not the name, is the claim a recruiter is here
              to test — so it sits directly under the greeting, and the intro
              below it supplies the evidence rather than the pitch. */}
          <p className={styles.thesis}>{copy.thesis}</p>
          <p className={styles.intro}>{copy.intro}</p>
          <div className={styles.ctas}>
            <a href="#ask" className={styles.ctaPrimary}>
              {copy.ctaPrimary}
            </a>
            <a href="#work" className={styles.ctaSecondary}>
              {copy.ctaSecondary}
            </a>
          </div>
        </div>

        <Portrait />
      </div>

      <HeroVariantSwitcher active={copy.id} />
    </section>
  );
}

/** Placeholder-mode only: lets the three claims be compared live. */
function HeroVariantSwitcher({ active }: { active: number }) {
  if (!PLACEHOLDER_MODE) return null;

  return (
    <div className={`wrap ${styles.switcher}`}>
      <p className={styles.switcherLabel}>Hero variant</p>
      <div className={styles.switcherRow}>
        {HERO_VARIANTS.map((variant) => (
          <a
            key={variant.id}
            href={variant.id === 0 ? "/" : `/?hero=${variant.id}`}
            className={
              variant.id === active
                ? `${styles.switcherLink} ${styles.switcherLinkActive}`
                : styles.switcherLink
            }
            aria-current={variant.id === active ? "true" : undefined}
          >
            <span className={styles.switcherNum}>{variant.id}</span>
            {variant.name}
          </a>
        ))}
      </div>
    </div>
  );
}
