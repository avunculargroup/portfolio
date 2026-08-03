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
