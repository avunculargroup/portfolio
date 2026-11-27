/**
 * Single home for limits, caps and constants. Model slugs and provider setup
 * live in `lib/openrouter.ts` — don't duplicate them here
 * (CLAUDE.md → engineering conventions).
 */

/** Cost cap: keep answers short and the loop bounded (spec §5). */
export const MAX_OUTPUT_TOKENS = 500;
export const MAX_STEPS = 6;

/**
 * draft_pitch composes its pitch in a nested model call. Bound it too, and cap
 * how many bullets it may return — the schema no longer carries min/max item
 * counts (they are not portable across structured-output implementations), so
 * the ceiling is enforced here instead.
 */
export const PITCH_MAX_OUTPUT_TOKENS = 900;
export const PITCH_MAX_ITEMS = 4;
/**
 * How many times draft_pitch tries to compose before degrading to a prose
 * answer. The model occasionally returns truncated or malformed emit_pitch
 * arguments (~1 in 5 for a poor-fit role, Nov 2026); one retry recovers most
 * of those for the cost of an occasional extra small call.
 */
export const PITCH_COMPOSE_ATTEMPTS = 2;

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

/**
 * Availability. Kept here rather than inline in the components because it is
 * the fact most likely to change, and it appears in more than one place
 * (hero, contact). It must stay in step with the `faq-availability` corpus
 * chunk — the agent answers from the corpus, the page reads from here.
 */
export const AVAILABILITY = {
  short: "Available mid-January 2027",
  full: "Available from mid-January 2027 · contract or permanent, full-time or part-time",
} as const;

/**
 * The starter prompts under the ask console. Kept here rather than inline in
 * the component because they are the highest-leverage copy on the page and
 * will want tuning independently of the markup (spec-broadening S3).
 *
 * The mix is deliberate: three that evidence the build, three that evidence
 * the interface work — requirements, executives, and the debt/ship trade-off.
 * A visitor assessing Chris for delivery, product or account work has
 * something to click, not just an architecture tour.
 *
 * Every `query` is covered by a retrieval eval in scripts/eval.ts — re-check
 * there before changing one.
 */
export const ASK_PROMPTS = [
  {
    label: "Shipped to production?",
    query: "What has he actually shipped to production?",
  },
  {
    label: "Code in a team?",
    query: "Can I see code he's written in a team?",
  },
  { label: "Led people?", query: "Has he led people, or just built things?" },
  {
    label: "Changing requirements?",
    query: "How does he handle changing client requirements?",
  },
  {
    label: "Non-technical execs?",
    query: "How does he work with executives who aren't technical?",
  },
  {
    label: "Debt vs shipping?",
    query:
      "Tell me about a time he balanced technical debt against shipping.",
  },
] as const;

/**
 * "Ask about this" links on /cv. Each opens the home page with `?ask=<id>`,
 * and AskSection sends the matching query once on load.
 *
 * An allow-list rather than free text on purpose: a free-text `?q=` would let
 * anyone craft a link that puts words in the agent's mouth on this site, under
 * Chris's name. Same rule as ASK_PROMPTS: every query here has a retrieval
 * eval in scripts/eval.ts.
 */
export const CV_ASK_PROMPTS = {
  "business-mono": "What is business-mono, and how did Chris build it?",
  bts: "What does Chris do at Bitcoin Treasury Solutions?",
  juvare: "What did Chris do at Juvare?",
  "beyond-essential": "What did Chris build at Beyond Essential Systems?",
  transition: "Why did he move from project management into engineering?",
  rmit: "What did Chris do at RMIT during the pandemic?",
  vtac: "What did Chris own at VTAC?",
} as const;

export type CvAskId = keyof typeof CV_ASK_PROMPTS;

export function isCvAskId(value: string | null): value is CvAskId {
  return value !== null && Object.hasOwn(CV_ASK_PROMPTS, value);
}

/** Site metadata. */
export const SITE = {
  name: "Chris Pollard",
  role: "Technical Product Lead — AI",
  title: "Chris Pollard — Technical Product Lead, AI",
  description:
    "Melbourne-based engineer who takes LLM agents from demo to production, with a decade of product and delivery behind it. Available from mid-January 2027 for contract or permanent roles. Ask the live agent about his work.",
  url: "https://chrispollard.com.au",
  email: "chris@chrispollard.com.au",
  location: "Melbourne, Australia",
  linkedin: "https://www.linkedin.com/in/chris-pollard-au",
  github: "https://github.com/avunculargroup/business-mono",
} as const;

/**
 * Illustrative blended token price used only for the trace panel's cost meter.
 * Haiku 4.5 is $1/MTok in, $5/MTok out; this is a rough blend for display.
 */
export const COST_PER_TOKEN_USD = 0.0000012;

/**
 * Which server-side capabilities are configured. Drives graceful degradation.
 * One OpenRouter key now fronts both chat and embeddings.
 */
export function getCapabilities() {
  const openrouter = Boolean(process.env.OPENROUTER_API_KEY);
  return {
    chat: openrouter,
    embeddings: openrouter,
    rateLimit: Boolean(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
    ),
  };
}
