import { AVAILABILITY } from "@/lib/config";
import { Portrait } from "./portrait";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.grid}`}>
        {/* display:contents below md so the heading, availability, intro and
            CTAs become items of the hero grid and can be placed around the
            portrait; a plain block column from md up (see hero.module.css). */}
        <div className={styles.copy}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>Hello, I&rsquo;m</p>
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
          <p className={styles.thesis}>
            I take LLM agents from demo to production.
          </p>
          <p className={styles.intro}>
            Hands-on engineer with a decade of product and delivery behind it.
            The flagship is solo-built, shipped, and running a real business
            every day, and I spent two years embedded with Australian state
            government agencies — police through primary industries — running
            the requirements and building what came out of them. Ask the agent
            below about my work — it&rsquo;s one I built.
          </p>
          <div className={styles.ctas}>
            <a href="#ask" className={styles.ctaPrimary}>
              Ask me something ↓
            </a>
            <a href="#work" className={styles.ctaSecondary}>
              See what I&rsquo;ve built
            </a>
          </div>
        </div>

        <Portrait />
      </div>
    </section>
  );
}
