import styles from "./experience-timeline.module.css";

const ROLES = [
  {
    year: "2025 — now",
    role: "Director",
    company: "Bitcoin Treasury Solutions",
    blurb:
      "Leading the AI practice and bitcoin education arm — directing the roadmap and client relationships, and building the technical system behind business-mono myself.",
  },
  {
    year: "2023 — now",
    role: "Technical Implementation Analyst",
    company: "Juvare",
    blurb:
      "Shipping front-end features for client-facing tools, and leading a code-review process I set up to mentor the junior developers on the team.",
  },
  {
    year: "2021 — 2023",
    role: "Software Engineer",
    company: "Beyond Essential Systems",
    blurb:
      "Full-stack work across a monorepo of microservices and a React Native app — I contributed to Tupaia, a health-data platform, and Tamanu, an EMR used across the Pacific.",
  },
  {
    year: "2021",
    role: "Software Engineering Immersive",
    company: "General Assembly",
    blurb:
      "Twelve weeks, full-time, learning to actually build things — JavaScript, Node, React, Postgres. The turning point.",
  },
  {
    year: "2015 — 2020",
    role: "Project Manager",
    company: "VTAC",
    blurb:
      "Led the build and launch of FlexiDirect, a SaaS platform — pricing, roadmap, and the whole cross-functional mess of shipping something real.",
  },
  {
    year: "2007 — 2015",
    role: "Project & operations roles",
    company: "RMIT · La Trobe · Monash · Melbourne · Swinburne",
    blurb:
      "A decade in project coordination and student admin. Not glamorous, but it's where I learned how organisations actually work.",
  },
] as const;

export function ExperienceTimeline() {
  return (
    <section className="blk" id="experience" aria-labelledby="experience-title">
      <div className="wrap">
        <p className="secEyebrow">Track record</p>
        <h2 id="experience-title" className="sectionTitle">
          Experience
        </h2>
        <p className="lead">
          A move from product and project management into engineering, and now
          into agentic systems — the product instinct came first, the code
          followed.
        </p>

        <ol className={styles.timeline}>
          {ROLES.map((entry) => (
            <li key={`${entry.company}-${entry.year}`} className={styles.item}>
              <span className={styles.year}>{entry.year}</span>
              <h3 className={styles.role}>{entry.role}</h3>
              <span className={styles.company}>{entry.company}</span>
              <p className={styles.blurb}>{entry.blurb}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
