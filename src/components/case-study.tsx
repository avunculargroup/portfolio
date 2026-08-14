import styles from "./case-study.module.css";

const SPECIALISTS = [
  "Recorder",
  "Archivist",
  "PM",
  "BA",
  "Content Creator",
  "Researcher",
  "RM",
  "Marketer",
  "Compliance",
] as const;

const DECISIONS = [
  {
    kicker: "Retrieval",
    title: "Hybrid search, not just vectors",
    body: "I didn't want the knowledge base guessing. It combines vector similarity, graph traversal, and full-text search, so each question gets the retrieval method suited to it, not a one-size-fits-all lookup.",
  },
  {
    kicker: "Control flow",
    title: "Pausing mid-thought, on purpose",
    body: "The requirements agent can stop mid-workflow to ask a clarifying question, then pick up right where it left off. Real work rarely happens in one uninterrupted pass, so I didn't build it that way.",
  },
  {
    kicker: "Safety",
    title: "Trust, earned in stages",
    body: "Actions graduate from human-confirmed, to batch-approved, to autonomous — but never all the way for the things that matter. Emails, published content, anything touching a client's money stays in a human's hands.",
  },
  {
    kicker: "Governance",
    title: "A compliance agent that can't be talked out of it",
    body: "Every piece of advice-framed writing gets reviewed against the actual regulations, logs its verdict, and re-checks itself the moment the copy changes. No shortcuts.",
  },
] as const;

export function CaseStudy() {
  return (
    <section className="blk" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <p className="secEyebrow">The system on show</p>
        {/* Named by what it does, not by its repo slug — "business-mono"
            means nothing to a visitor, and the CV, LinkedIn Featured section
            and GitHub landing all lead with this phrasing. */}
        <h2 id="work-title" className="sectionTitle">
          Multi-agent operations platform — Bitcoin Treasury Solutions
        </h2>
        <p className={styles.subtitle}>business-mono</p>
        <p className="lead">
          Plainly: it&rsquo;s the software that runs a small business&rsquo;s
          operations — client records, research, content, compliance review,
          project management — as a set of LLM agents with a human at the edge
          of every decision that matters. The business it runs happens to be a
          bitcoin one; nothing about the system depends on that.
        </p>
        <p className="lead">
          Picture a hub-and-spoke team: one coordinator agent, Simon, routes
          work to a roster of specialists, all reading and writing to the same
          database. Running it is less like maintaining code and more like
          running a team — nine specialists, one point of accountability. I
          designed the architecture, I explain the trade-offs to clients, and
          I&rsquo;m the one who answers for every decision below.
        </p>
        <p className={styles.repoLine}>
          The repository is public, so none of this has to be taken on trust.
        </p>
        <a
          className={styles.repoLink}
          href="https://github.com/avunculargroup/business-mono"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/avunculargroup/business-mono ↗
        </a>

        <div
          className={styles.arch}
          role="img"
          aria-label="Architecture: directors reach the system through Signal and web; Simon, the coordinator, is the only agent that talks to humans; Simon routes to nine specialist agents; all agents share one Supabase Postgres database with pgvector."
        >
          <span className={styles.archTier}>Directors (Signal · Web)</span>
          <span className={styles.archArrow} aria-hidden="true">
            ↕
          </span>
          <span className={styles.archSimon}>Simon — coordinator</span>
          <span className={styles.archArrow} aria-hidden="true">
            ↕
          </span>
          <div className={styles.archSpecialists}>
            {SPECIALISTS.map((role) => (
              <span key={role} className={styles.archPill}>
                {role}
              </span>
            ))}
          </div>
          <span className={styles.archArrow} aria-hidden="true">
            ↕
          </span>
          <span className={styles.archTier}>
            Supabase — Postgres + pgvector (shared)
          </span>
        </div>

        <div className={styles.cards}>
          {DECISIONS.map((decision) => (
            <article key={decision.title} className={styles.card}>
              <p className={styles.kicker}>{decision.kicker}</p>
              <h3 className={styles.cardTitle}>{decision.title}</h3>
              <p className={styles.cardBody}>{decision.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
