/**
 * Single home for tunables. Nothing model- or limit-related should be
 * hard-coded elsewhere in the app (CLAUDE.md → engineering conventions).
 */

/**
 * Chat model. Claude Haiku — cheap, fast, public endpoint.
 * Verify against https://docs.claude.com/en/docs/about-claude/models before changing.
 */
export const CHAT_MODEL = "claude-haiku-4-5-20251001" as const;

/** Embedding model + dimensionality. Must match what `scripts/embed-corpus.ts` wrote. */
export const EMBEDDING_MODEL = "text-embedding-3-small" as const;
export const EMBEDDING_DIMENSIONS = 1536 as const;

/** Cost cap: keep answers short and the loop bounded (spec §5). */
export const MAX_OUTPUT_TOKENS = 500;
export const MAX_STEPS = 6;

/** Retrieval defaults. */
export const RETRIEVAL_TOP_K = 3;
/** Chunks scoring below this are treated as "no useful match" rather than padding. */
export const RETRIEVAL_MIN_SCORE = 0.1;

/** Rate limiting (spec §5). Per-IP sliding window + a per-session message cap. */
export const RATE_LIMIT_REQUESTS = 20;
export const RATE_LIMIT_WINDOW = "1 h" as const;
export const SESSION_MESSAGE_CAP = 12;

/** Guard against pathological inputs before they reach the model. */
export const MAX_INPUT_CHARS = 1000;
export const MAX_THREAD_MESSAGES = 40;

/** Site metadata. */
export const SITE = {
  name: "Chris Pollard",
  role: "AI Delivery Lead",
  title: "Chris Pollard — AI Delivery Lead",
  description:
    "Melbourne-based AI delivery lead — a hands-on engineer who also brings a decade of project and product management. Ask the live agent about his work.",
  url: "https://chrispollard.dev",
  email: "cpollard@protonmail.com",
  location: "Melbourne, Australia",
  linkedin: "https://www.linkedin.com/in/chris-pollard-au",
  github: "https://github.com/avunculargroup/business-mono",
} as const;

/**
 * Illustrative blended token price used only for the trace panel's cost meter.
 * Haiku 4.5 is $1/MTok in, $5/MTok out; this is a rough blend for display.
 */
export const COST_PER_TOKEN_USD = 0.0000012;

/** Which server-side capabilities are configured. Drives graceful degradation. */
export function getCapabilities() {
  return {
    chat: Boolean(process.env.ANTHROPIC_API_KEY),
    embeddings: Boolean(process.env.OPENAI_API_KEY),
    rateLimit: Boolean(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
    ),
  };
}
