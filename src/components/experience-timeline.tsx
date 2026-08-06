import styles from "./experience-timeline.module.css";

interface Role {
  year: string;
  role: string;
  company: string;
  blurb: string;
  /** Marks the one role held today, so the current position reads at a glance. */
  current?: boolean;
}

const ROLES: Role[] = [
  {
    year: "2025 — now",
    role: "Director",
    company: "Bitcoin Treasury Solutions",
    current: true,
    blurb:
      "My current role, and where the AI work sits. I architected and built business-mono — a multi-agent operations platform in TypeScript on Mastra, Next.js 15 and Supabase with pgvector — and it runs the business daily. I also own the roadmap and the client relationships.",
  },
  {
    year: "2023 — 2026",
    role: "Technical Implementation Analyst",
    company: "Juvare",
    blurb:
      "Two years embedded with ANZ state government agencies — police through primary industries — running requirements with them and tailoring WebEOC, their incident management platform, into applications that fit how they actually work. Front-end build inside a legacy codebase, plus mentoring and a code-review process I set up.",
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
    year: "2014 — 2020",
    role: "Project Manager",
    company: "VTAC",
    blurb:
      "Led the build and launch of FlexiDirect, a SaaS platform — pricing, roadmap, and the whole cross-functional mess of shipping something real. I also grew the project management office from one person (me) to six.",
  },
  {
    year: "2007 — 2014",
    role: "Project & operations roles",
    company: "RMIT · La Trobe · Monash · Melbourne · Swinburne",
    blurb:
      "A decade in project coordination and student admin. Not glamorous, but it's where I learned how organisations actually work.",
  },
];

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
              <span className={styles.year}>
                {entry.year}
                {entry.current && <span className={styles.now}>Current</span>}
              </span>
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
