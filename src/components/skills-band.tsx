import styles from "./skills-band.module.css";

const GROUPS = [
  {
    title: "Language & frameworks",
    tags: [
      "TypeScript",
      "Next.js 15",
      "React",
      "React Native",
      "Node.js",
      "Mastra",
    ],
  },
  {
    title: "LLM & data",
    tags: ["Agent orchestration", "RAG", "pgvector", "Supabase", "Evals"],
  },
  {
    title: "Systems & delivery",
    tags: [
      "Railway",
      "Vercel",
      "Webhooks",
      "Ingestion pipelines",
      "Docs-first",
    ],
  },
  /* Deliberately the fourth column and not a footnote: a visitor scanning a
     stack list is forming a category judgement about what kind of
     professional this is, and an all-technical list answers that before they
     read a word of prose. Keep it visually equal to the other three
     (spec-broadening S4). */
  {
    title: "Product & delivery",
    tags: [
      "Requirements elicitation",
      "Discovery workshops",
      "User stories",
      "Roadmapping",
      "Agile and hybrid delivery",
      "Stakeholder alignment",
      "Cross-functional coordination",
    ],
  },
] as const;

export function SkillsBand() {
  return (
    <section className={`blk ${styles.section}`} aria-labelledby="stack-title">
      <div className="wrap">
        <p className="secEyebrow">Stack</p>
        <h2 id="stack-title" className="sectionTitle">
          What I build with
        </h2>

        <div className={styles.grid}>
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <ul className={styles.tags}>
                {group.tags.map((tag) => (
                  <li key={tag} className={styles.tag}>
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
