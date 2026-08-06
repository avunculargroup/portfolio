import styles from "./principles.module.css";

/*
 * Grounded in the `wow-listening` and `wow-ownership` corpus chunks — the same
 * two principles the agent will cite, said here in Chris's own voice
 * (CLAUDE.md → voice & copy: static copy is first person).
 */
const PRINCIPLES = [
  {
    title: "I listen more than I talk.",
    body: "I pay as much attention to what people aren't saying as to what they are. Most people already know the right decision — what they need is a room safe enough to say it out loud. It's why elicitation and human-in-the-loop keep turning up in the systems I build: the same instinct, written down as architecture.",
  },
  {
    title: "I own the decisions — including the wrong ones.",
    body: "Making the call isn't the hard part. Standing behind it in public when it turns out badly is, and it's worth doing: it's how a team learns, and it sets the norm that being honest costs you nothing here. Easy to say. Genuinely hard to do.",
  },
] as const;

export function Principles() {
  return (
    <section className="blk" id="principles" aria-labelledby="principles-title">
      <div className="wrap">
        <p className="secEyebrow">How I work</p>
        <h2 id="principles-title" className="sectionTitle">
          Two things I&rsquo;ve believed for a decade
        </h2>
        <p className="lead">
          The tech I use has changed several times over. These haven&rsquo;t.
        </p>

        <div className={styles.grid}>
          {PRINCIPLES.map((principle) => (
            <article key={principle.title} className={styles.item}>
              <h3 className={styles.title}>{principle.title}</h3>
              <p className={styles.body}>{principle.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
