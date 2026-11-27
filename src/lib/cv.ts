/**
 * The CV — single source for /cv (web) and /cv/print (the page the PDF is
 * generated from). Edit the CV here and nowhere else, then run
 * `npm run cv:pdf` to regenerate public/cv/chris-pollard-cv.pdf.
 *
 * Rules (CLAUDE.md → non-negotiables apply here too):
 * - Every line must be defensible in an interview and agree with
 *   data/corpus.json. `npm run cv:check` enforces the known traps.
 * - No phone number. This is the public CV; the phone goes on copies sent
 *   directly to people.
 * - `ask` ids must exist in CV_ASK_PROMPTS (lib/config), and each of those
 *   prompts has a retrieval eval in scripts/eval.ts.
 */
import { AVAILABILITY, SITE, type CvAskId } from "@/lib/config";

/** Shown on the page and stamped into the PDF. Bump it with every edit. */
export const CV_UPDATED = "November 2026";

/** Public path of the generated PDF (written by scripts/generate-cv-pdf.ts). */
export const CV_PDF_PATH = "/cv/chris-pollard-cv.pdf";
/** Filename the browser saves it as (see the header in next.config.mjs). */
export const CV_PDF_FILENAME = "Chris-Pollard-CV.pdf";

export interface CvRole {
  org: string;
  title: string;
  /** Two halves so the date can break cleanly onto two lines in print. */
  from: string;
  to: string;
  place?: string;
  current?: boolean;
  summary?: string;
  points?: readonly string[];
  ask?: CvAskId;
}

export interface CvFact {
  label: string;
  text: string;
}

export const CV = {
  name: SITE.name,
  role: SITE.role,
  thesis: "I work in the gap between the business and the engineers.",
  location: SITE.location,
  email: SITE.email,
  availability: AVAILABILITY.full,
  links: [
    { label: "chrispollard.com.au", href: SITE.url },
    {
      label: "github.com/avunculargroup",
      href: "https://github.com/avunculargroup",
    },
    { label: "linkedin.com/in/chris-pollard-au", href: SITE.linkedin },
  ],

  profile:
    "Technical product manager. I spent about a decade in project and product delivery, then five years as a software engineer, and since late 2025 I’ve been building AI agent systems for my own company. Because I’ve done both jobs, I can follow the roadmap and stakeholder conversation and what’s actually being built, and help both sides work towards the same thing. I keep a human in the loop on automated decisions, and I care that what ships is trusted and actually used.",

  build: {
    eyebrow: "Selected build",
    name: "business-mono",
    href: "https://github.com/avunculargroup/business-mono",
    hrefLabel: "Public repo",
    summary:
      "The operations platform behind Bitcoin Treasury Solutions, architected and shipped solo since late 2025. It monitors news and podcast sources, keeps what matters in a searchable knowledge base, and runs curation workflows on top, including a daily news email. It started as a coordinator agent routing to specialists; most jobs now run as structured workflows, because they proved more reliable.",
    facts: [
      {
        label: "Hybrid retrieval",
        text: "pgvector (HNSW) similarity, graph traversal and Postgres full-text search, matched to the query.",
      },
      {
        label: "Trust is graduated",
        text: "Actions earn autonomy in stages. Emails, published content and CRM writes always need a human.",
      },
      {
        label: "Compliance in the loop",
        text: "An agent checks advice-framed drafts against AFSL rules, records its verdict and never auto-approves.",
      },
      {
        label: "Verified, not assumed",
        text: "Vitest suites and typecheck gate every change in CI; LLM routing and prompt evals run on demand.",
      },
    ] satisfies readonly CvFact[],
    stack: "Mastra · Next.js 15 · Supabase / pgvector · Turborepo · Railway · Vercel",
    ask: "business-mono" as CvAskId,
  },

  /* Most recent first. The page break in print falls before Beyond Essential
     (see `printBreakBefore` below). */
  roles: [
    {
      org: "Bitcoin Treasury Solutions",
      title: "Co-founder & Principal Engineer",
      from: "Mar 2025 –",
      to: "now",
      place: "Melbourne",
      current: true,
      summary:
        "Structured bitcoin training for professionals, SMEs and individuals. I set up Avuncular Group Pty Ltd, the company behind it, run its strategy and administration, and own the technology end to end. My co-founder, Carolyn Crawford, leads the commercial and training side. It’s pre-revenue, so each build decision is also a business trade-off.",
      ask: "bts",
    },
    {
      org: "Juvare",
      title: "Technical Implementation Analyst",
      from: "Dec 2023 –",
      to: "May 2026",
      place: "Melbourne",
      summary:
        "WebEOC, the emergency and incident management platform Australian state agencies rely on during incidents. About 70% front-end, 20% business analysis, 10% client work.",
      points: [
        "Sat with agencies from police to primary industries, ran the requirements conversation, then built the result into WebEOC myself.",
        "Rebuilt Excel-based processes as systems, working inside legacy constraints (jQuery, older JS bundles) and trialling web components to modernise in steps.",
        "Mentored developers locally and remotely, supervised onboarding and led the rollout of a code-review system.",
      ],
      ask: "juvare",
    },
    {
      org: "Beyond Essential Systems",
      title: "Software Engineer",
      from: "Sep 2021 –",
      to: "Dec 2023",
      place: "Melbourne",
      summary:
        "Full-stack product engineering in a shared monorepo on Tupaia, an open-source health-data platform for low-resource settings, and Tamanu, an electronic medical record system for the Pacific.",
      points: [
        "Built chart and map visualisation features and the admin panel that configures them, plus REST APIs, server-side microservices, database structure and end-to-end tests.",
        "First months in developer education for a new map-configuration tool: wrote its docs, onboarded the analysts using it, then built the fixes their friction exposed.",
        "AWS deployment and service work in a flat DevOps team; React Native app work.",
      ],
      ask: "beyond-essential",
    },
    {
      org: "General Assembly",
      title: "Software Engineering Immersive",
      from: "Feb –",
      to: "Aug 2021",
      place: "Melbourne",
      summary:
        "Full-time immersive across two intakes: a deliberate move from product management into engineering. I went straight into full-stack work at Beyond Essential.",
      ask: "transition",
    },
    {
      org: "RMIT University",
      title: "Project Manager, pandemic response",
      from: "Mar –",
      to: "Dec 2020",
      place: "Melbourne",
      summary:
        "Drove consensus among senior executives with competing priorities and no precedent, while government direction changed week to week. Translated operational detail into decisions, then decisions back into workable operations.",
      ask: "rmit",
    },
    {
      org: "VTAC",
      title: "Project Manager (product)",
      from: "Nov 2014 –",
      to: "Mar 2020",
      place: "Melbourne",
      points: [
        "Owned the FlexiDirect SaaS application portal as product manager: client discovery, pricing model, roadmap and release, with developers, testers and UX designers.",
        "Ran delivery as a translation layer: iterative for the Agile dev team, milestone-shaped for university clients with fixed admissions deadlines.",
        "Built and led the project management office, growing it from one person to six (2018–2020) and setting its documentation, risk and change practice.",
        "Led proposals, scoping and statements of work, and oversaw tender responses, with senior executives in a consortium where clients were also owners.",
      ],
      ask: "vtac",
    },
    {
      org: "Earlier career",
      title: "",
      from: "2007 –",
      to: "2014",
      summary:
        "Video production: my own small business, plus camera and editing on community television (2007–08). Then university student administration at Swinburne, Melbourne and Monash, and a project role at La Trobe that led to VTAC.",
    },
  ] satisfies readonly CvRole[],

  skills: [
    {
      label: "Product & delivery",
      items: [
        "Discovery and requirements elicitation · roadmaps and pricing · executive facilitation · user stories · PMO set-up · proposals and SOWs · Jira · information and interface design",
      ],
    },
    {
      label: "AI & engineering",
      items: [
        "Agent orchestration · RAG and hybrid search · tool use · human-in-the-loop design · evals",
        "TypeScript, Node.js, React, Next.js 15, React Native, PostgreSQL, Supabase, Mastra, Vercel AI SDK, AWS. Some Python.",
      ],
    },
    {
      label: "Education",
      items: [
        "Victorian Certificate of Education (VCE), Xavier College, 2003",
        "Bachelor of Performing Arts, Monash University, 2004–2007",
        "Graduate Diploma in Education, La Trobe University, 2009–2010",
        "PRINCE2 Practitioner, 2016 (lapsed) · WebEOC Bootcamp · Bitcoin protocol development seminars",
      ],
    },
  ],
} as const;

/** In print, page 2 starts at this role. Keeps the PDF to two clean pages. */
export const PRINT_BREAK_BEFORE = "Beyond Essential Systems";
