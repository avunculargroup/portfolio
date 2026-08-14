/**
 * Structured project records for the `get_project_detail` tool.
 *
 * Every field here must be supportable by the corpus — this is a structured
 * view of the same facts, not an additional source of claims. If you add a
 * project, add matching corpus chunks too (CLAUDE.md → non-negotiables).
 */

export interface ProjectRecord {
  id: string;
  name: string;
  url: string;
  /** Corpus chunk ids that back this record, so answers stay citable. */
  sources: string[];
  problem: string;
  architecture: string;
  decisions: { title: string; detail: string }[];
  stack: string[];
  scale: string;
}

export const PROJECTS = {
  "business-mono": {
    id: "business-mono",
    name: "business-mono",
    url: "https://github.com/avunculargroup/business-mono",
    sources: [
      "project-overview",
      "project-coordination",
      "project-retrieval",
      "project-elicitation",
      "project-approvals",
      "project-compliance",
      "project-ingestion",
      "project-deployment",
      "scale-ownership",
    ],
    problem:
      "Bitcoin Treasury Solutions needed its operations — client records, research, content, compliance review and project management — run reliably by a very small team. The problem was not 'add a chatbot' but 'make routine operations dependable enough to trust', with a human at the edge of every automated decision.",
    architecture:
      "Hub-and-spoke. A coordinator agent (Simon) is the only agent that talks to humans, and routes each request to a specialist — recorder, archivist, project manager, business analyst, content, research, relationship and compliance roles — all sharing one Supabase Postgres database behind a consistent audit trail. A Mastra server runs the agents and workflows; a Next.js 15 app handles dashboards and human approvals. Real-world input arrives through a Signal interface for directors plus telephony and meeting sources, with speech transcription feeding the same knowledge base the agents retrieve from.",
    decisions: [
      {
        title: "Hub-and-spoke over a flat swarm",
        detail:
          "Centralising human contact in one coordinator keeps behaviour predictable and the whole system observable, rather than having many agents independently deciding to contact a human.",
      },
      {
        title: "Hybrid retrieval, not a single vector lookup",
        detail:
          "The knowledge base combines pgvector (HNSW) similarity, graph traversal across knowledge connections, and Postgres full-text search, so each query uses the method that fits it. Embeddings come from OpenAI text-embedding-3-small at 1536 dimensions.",
      },
      {
        title: "Suspend / resume elicitation",
        detail:
          "The requirements workflow runs multi-round clarification loops using Mastra's suspend and resume — it pauses mid-workflow to ask a human, then resumes with that answer folded in. Structured elicitation with state carried across turns, not a single hopeful prompt.",
      },
      {
        title: "Approval graduation",
        detail:
          "Operations earn autonomy in stages: human-confirmed, then batch-approved, then autonomous as they prove reliable. High-risk actions — outbound emails, published content and CRM writes — stay human-approved regardless of track record. Trust is graduated, not granted.",
      },
      {
        title: "A compliance gate inside the loop",
        detail:
          "A dedicated compliance agent reviews advice-framed drafts against Australian financial-services (AFSL) rules, records its verdict and never auto-approves. If the copy changes, the review re-runs — governance is wired into the workflow rather than left to a final human glance.",
      },
      {
        title: "Deterministic tests in CI, LLM evals on demand",
        detail:
          "Vitest suites and typecheck gate every change in CI; the LLM eval suite for agent routing and prompts runs on demand, because non-deterministic model calls don't belong in a PR gate.",
      },
    ],
    stack: [
      "TypeScript",
      "Mastra (agents + workflows)",
      "Next.js 15 (App Router)",
      "Supabase — Postgres + pgvector",
      "Turborepo monorepo",
      "Railway (agents)",
      "Vercel (web app)",
      "Vitest (CI-gated) · LLM evals on demand",
    ],
    scale:
      "A genuinely solo build: the coordinator, the specialist agents, the workflows, the ingestion pipelines and the web app were all architected and shipped by one person, across a Turborepo monorepo with CI-gated test suites. It has been under sustained development rather than built in a burst, and it runs a real business daily. The repository is public, so the scope can be inspected rather than taken on trust.",
  },
} as const satisfies Record<string, ProjectRecord>;

export type ProjectId = keyof typeof PROJECTS;

export const PROJECT_IDS = Object.keys(PROJECTS) as [ProjectId, ...ProjectId[]];

export function getProject(id: ProjectId): ProjectRecord {
  return PROJECTS[id];
}
