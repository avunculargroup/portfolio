import styles from "./experience-timeline.module.css";

interface Role {
  year: string;
  role: string;
  company: string;
  /** An array where the entry needs more than one paragraph to land. */
  blurb: string | readonly string[];
  /** Marks the one role held today, so the current position reads at a glance. */
  current?: boolean;
}

const ROLES: Role[] = [
  {
    year: "2025 — now",
    role: "Co-founder & Principal Engineer",
    company: "Bitcoin Treasury Solutions",
    current: true,
    blurb:
      "We co-founded this one — Carolyn Crawford leads the commercial and training side, I own the technology end to end. I architected and built business-mono, a multi-agent operations platform in TypeScript on Mastra, Next.js 15 and Supabase with pgvector, and it runs the business daily.",
  },
  {
    year: "2023 — 2026",
    role: "Technical Implementation Analyst",
    company: "Juvare",
    /* The longest entry on the timeline, and deliberately so: this is the
       strongest evidence of the interface work, and as a build credit alone
       it read as far less than it was (spec-broadening S6). */
    blurb: [
      "Australian state government agencies — police through primary industries — running systems people depend on during live incidents. My job was to sit with them, understand how they actually operate, and turn that into working software.",
      "The friction was structural. Agencies needed the system to match processes they couldn't change, and WebEOC — their incident management platform — had real constraints underneath: jQuery and legacy bundles. Neither side could simply be told no. So the work was finding what the agency actually needed underneath what they asked for, and what the platform could honestly deliver, and landing something in the overlap. I ran that conversation and then I built the result.",
      "Alongside the client work: mentoring, and a code-review process I set up.",
    ],
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
    year: "2020",
    role: "Project Manager",
    company: "RMIT University",
    blurb:
      "Pandemic response. The constraint was almost never technical — it was getting senior people with different operational realities to agree on one course of action, quickly, while government direction changed underneath us.",
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
    company: "La Trobe · Monash · Melbourne · Swinburne",
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
              {(typeof entry.blurb === "string"
                ? [entry.blurb]
                : entry.blurb
              ).map((para) => (
                <p key={para} className={styles.blurb}>
                  {para}
                </p>
              ))}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
