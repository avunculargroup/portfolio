import { FactSlot } from "./fact-slot";
import styles from "./experience-timeline.module.css";

interface Role {
  year: string;
  role: string;
  company: string;
  /** An array where the entry needs more than one paragraph to land. */
  blurb: string | readonly string[];
  /**
   * Labelled sub-slots for the two team-codebase roles. Two years of commits
   * alongside other engineers is the one thing the solo project cannot
   * evidence, and a two-sentence blurb buried it — so those entries get room
   * for the engineering substance instead (placeholder pass, August 2026).
   * Labels render only in placeholder mode; with real copy these are plain
   * paragraphs under the blurb.
   */
  detail?: readonly { slot: string; label: string; body: string }[];
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
       it read as far less than it was (spec-broadening S6).

       RETIRED IN THE PLACEHOLDER PASS (August 2026) — kept verbatim so the
       rewrite can be diffed against it. The third paragraph is the specific
       problem: "mentoring, and a code-review process I set up" is nine words
       for two years of work in a shared codebase.

       blurb: [
         "Australian state government agencies — police through primary industries — running systems people depend on during live incidents. My job was to sit with them, understand how they actually operate, and turn that into working software.",
         "The friction was structural. Agencies needed the system to match processes they couldn't change, and WebEOC — their incident management platform — had real constraints underneath: jQuery and legacy bundles. Neither side could simply be told no. So the work was finding what the agency actually needed underneath what they asked for, and what the platform could honestly deliver, and landing something in the overlap. I ran that conversation and then I built the result.",
         "Alongside the client work: mentoring, and a code-review process I set up.",
       ],
    */
    blurb: [
      "{{FAKE: Australian state government agencies — police through primary industries — running systems people depend on during live incidents. I sat with them, worked out how they actually operate, and then built it.}}",
      "{{FAKE: The friction was structural. Agencies needed the system to match processes they couldn't change; WebEOC had jQuery and legacy bundles underneath. Neither side could be told no. I ran that conversation and then I shipped the result.}}",
    ],
    detail: [
      {
        slot: "The codebase and the team — size, language, how many engineers",
        label: "The codebase",
        body: "{{FAKE: A 400,000-line WebEOC deployment in jQuery, PHP and a newer React surface, worked on by 8 engineers across Melbourne and Atlanta. I was in it daily for 2 years and 4 months.}}",
      },
      {
        slot: "What you built — named components, not 'various features'",
        label: "What I built",
        body: "{{FAKE: The incident-timeline board used by all 6 agencies, the Acme Emergency Services roster import, and a form-definition engine that replaced 40 hand-maintained forms with one schema.}}",
      },
      {
        slot: "Testing — what you wrote, what coverage meant here, what it caught",
        label: "Testing",
        body: "{{FAKE: I introduced Jest to a codebase that had 0 tests and got the form engine to 90% coverage. The suite caught a rostering bug that would have paged the wrong 200 people during a live incident.}}",
      },
      {
        slot: "Review and collaboration — the process you set up, and whether it stuck",
        label: "Review and collaboration",
        body: "{{FAKE: I set up the code-review process: 2 reviewers on anything touching incident data, 1 on everything else, and a written rule that review comments explain the why. I reviewed roughly 500 pull requests and mentored 2 junior engineers through their first year.}}",
      },
      {
        slot: "The constraint that shaped the engineering — the one you couldn't design around",
        label: "The constraint",
        body: "{{FAKE: No downtime, ever — these systems are load-bearing during floods and fires. Every change shipped behind a flag, and nothing merged on a Friday.}}",
      },
    ],
  },
  {
    year: "2021 — 2023",
    role: "Software Engineer",
    company: "Beyond Essential Systems",
    /* RETIRED IN THE PLACEHOLDER PASS (August 2026) — kept verbatim for the
       diff. One sentence for two years of commits in a shared monorepo:

       blurb:
         "Full-stack work across a monorepo of microservices and a React Native app — I contributed to Tupaia, a health-data platform, and Tamanu, an EMR used across the Pacific.",
    */
    blurb:
      "{{FAKE: Two years full-stack in a shared monorepo — Tupaia, a health-data platform, and Tamanu, an EMR used across the Pacific. My first engineering job, and the one where I learned what working in someone else's code actually costs.}}",
    detail: [
      {
        slot: "The codebase and the team — size, language, how many engineers",
        label: "The codebase",
        body: "{{FAKE: A JavaScript monorepo of 14 microservices plus a React Native app, 25 engineers across 4 time zones. I committed to it for 2 years.}}",
      },
      {
        slot: "What you built — named components, not 'various features'",
        label: "What I built",
        body: "{{FAKE: The offline sync layer for the Tamanu mobile app, the Tupaia survey-response API, and a dashboard-config migration that moved 300 dashboards off a hand-edited JSON blob.}}",
      },
      {
        slot: "Testing — what you wrote, what coverage meant here, what it caught",
        label: "Testing",
        body: "{{FAKE: Jest and Playwright, run on every pull request. The offline sync work needed a test harness that could simulate a clinic losing connectivity mid-write — I built that, and it found 7 data-loss cases before any of them reached a device.}}",
      },
      {
        slot: "Review and collaboration — how review worked, what you learned from it",
        label: "Review and collaboration",
        body: "{{FAKE: Every change reviewed by at least one of the 25. My first month averaged 11 review comments per pull request; by the end I was the reviewer on the sync layer. Pair-programmed weekly with an engineer in Suva.}}",
      },
      {
        slot: "The constraint that shaped the engineering — the one you couldn't design around",
        label: "The constraint",
        body: "{{FAKE: A clinic on an island with 2 hours of connectivity a day. Everything had to work offline first and reconcile later, and being wrong about that was a patient record, not a bug.}}",
      },
    ],
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
              {entry.detail && (
                <div className={styles.detail}>
                  {entry.detail.map((part) => (
                    <FactSlot key={part.label} label={part.slot}>
                      <p className={styles.detailLabel}>{part.label}</p>
                      <p className={styles.detailBody}>{part.body}</p>
                    </FactSlot>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
