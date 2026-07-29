import styles from "./experience-timeline.module.css";

const ROLES = [
  {
    year: "2025 — now",
    role: "Director",
    company: "Bitcoin Treasury Solutions",
    blurb:
      "Structured bitcoin training for professionals, SMEs and individuals — and the venture behind business-mono.",
  },
  {
    year: "2023 — now",
    role: "Technical Implementation Analyst",
    company: "Juvare",
    blurb:
      "Front-end features and responsive client interfaces; led a code-review system and mentors junior developers.",
  },
  {
    year: "2021 — 2023",
    role: "Software Engineer",
    company: "Beyond Essential Systems",
    blurb:
      "Full-stack in a monorepo — microservices and a React Native app. Contributed to Tupaia (health-data platform) and Tamanu (Pacific EMR).",
  },
  {
    year: "2021",
    role: "Software Engineering Immersive",
    company: "General Assembly",
    blurb:
      "A 12-week full-time transition into engineering — JavaScript, Node, React, REST, PostgreSQL.",
  },
  {
    year: "2015 — 2020",
    role: "Project Manager",
    company: "VTAC",
    blurb:
      "Led the build and launch of the FlexiDirect SaaS platform as product manager — pricing model, roadmap, cross-functional delivery.",
  },
  {
    year: "2007 — 2015",
    role: "Project & operations roles",
    company: "RMIT · La Trobe · Monash · Melbourne · Swinburne",
    blurb:
      "A decade in project coordination, student administration and operations — the grounding behind the product sense.",
  },
] as const;

export function ExperienceTimeline() {
  return (
    <section className="blk" id="experience" aria-labelledby="experience-title">
      <div className="wrap">
        <p className="secEyebrow mono">Track record</p>
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
