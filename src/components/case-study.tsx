import styles from "./case-study.module.css";

const DECISIONS = [
  {
    kicker: "Retrieval",
    title: "Hybrid search, not just vectors",
    body: "The knowledge base combines pgvector (HNSW) similarity, graph traversal over knowledge connections, and Postgres full-text — so lookups use the right method for the question.",
  },
  {
    kicker: "Control flow",
    title: "Suspend / resume elicitation",
    body: "The requirements agent runs multi-round clarification loops, pausing mid-workflow for human input and resuming — structured elicitation, not a single prompt.",
  },
  {
    kicker: "Safety",
    title: "Approval graduation",
    body: "Actions move human-confirmed → batch → autonomous as they earn trust. Emails, published content, and CRM writes stay human-approved regardless of track record.",
  },
  {
    kicker: "Governance",
    title: "A compliance gate in the loop",
    body: "A dedicated compliance agent reviews advice-framed drafts against AFSL rules, logs verdicts, and never auto-approves — re-running when copy changes.",
  },
] as const;

export function CaseStudy() {
  return (
    <section className="blk" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <p className={`secEyebrow mono`}>The system on show</p>
        <h2 id="work-title" className="sectionTitle">
          business-mono — a solo-built multi-agent operations platform
        </h2>
        <p className="lead">
          A hub-and-spoke architecture: a coordinator agent (Simon) routes work
          to a roster of specialists, all sharing one Supabase database. A Mastra
          server runs the agents and workflows; a Next.js app handles dashboards
          and approvals. Below is the shape, then the decisions worth talking
          about.
        </p>

        <div className={styles.arch} role="img" aria-label="Architecture: directors reach the system through Signal and web; Simon, the coordinator, is the only agent that talks to humans; Simon routes to specialist agents — recorder, archivist, project manager, business analyst, content, researcher, relationship manager, marketer and compliance; all agents share one Supabase Postgres database with pgvector.">
          <div className={styles.archInner} aria-hidden="true">
            <span className={styles.mut}>Directors</span> (Signal · Web){"\n"}
            {"     ↕\n"}
            {"  "}
            <span className={styles.amber}>Simon</span>{" "}
            <span className={styles.mut}>
              — coordinator (only agent that talks to humans)
            </span>
            {"\n     ↕\n"}
            <span className={styles.lvl}>
              Recorder · Archivist · PM · BA · Content · Researcher · RM ·
              Marketer · Compliance
            </span>
            {"\n     ↕\n  "}
            <span className={styles.mut}>
              Supabase — Postgres + pgvector (shared)
            </span>
          </div>
        </div>

        <div className={styles.cards}>
          {DECISIONS.map((decision) => (
            <article key={decision.title} className={styles.card}>
              <p className={`${styles.kicker} mono`}>{decision.kicker}</p>
              <h3 className={styles.cardTitle}>{decision.title}</h3>
              <p className={styles.cardBody}>{decision.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
