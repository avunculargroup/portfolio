import { Portrait } from "./portrait";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.grid}`}>
        {/* display:contents below md so the heading, intro and CTAs become
            items of the hero grid and can be placed around the portrait;
            a plain block column from md up (see hero.module.css). */}
        <div className={styles.copy}>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>Hello, I&rsquo;m</p>
            <h1 className={styles.name}>Chris Pollard.</h1>
          </div>
          <p className={styles.intro}>
            Ten years leading projects and people came before I ever wrote
            code. Now I run the AI practice at a bitcoin advisory — I set the
            technical direction, I&rsquo;m the one clients and the board hold
            accountable, and yes, I still build the systems myself. This site
            is one of them. Ask it something real.
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
