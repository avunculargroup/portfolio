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
  short: "Fractional & part-time now",
  full: "Open to work now · fractional and part-time immediately, full-time from January 2027",
} as const;

/** Site metadata. */
export const SITE = {
  name: "Chris Pollard",
  role: "Technical Product Lead — AI",
  title: "Chris Pollard — Technical Product Lead, AI",
  description:
    "Melbourne-based engineer who takes LLM agents from demo to production, with a decade of product and delivery behind it. Fractional and part-time now, full-time from January 2027. Ask the live agent about his work.",
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
