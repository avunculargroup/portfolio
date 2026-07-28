/**
 * Public-endpoint protection (spec §5).
 *
 * Two independent limits:
 *   - per-IP sliding window, so one visitor can't drain the budget
 *   - per-request thread length cap, so a single session can't loop forever
 *
 * Upstash is optional. If it isn't configured the endpoint still works and the
 * thread cap still applies — we just can't enforce the cross-request IP limit.
 * That's a deliberate trade: the site degrades rather than 500s.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  RATE_LIMIT_REQUESTS,
  RATE_LIMIT_WINDOW,
  SESSION_MESSAGE_CAP,
} from "@/lib/config";

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW),
    analytics: false,
    prefix: "portfolio-agent",
  });

  return limiter;
}

/**
 * Best-effort client identifier. Anonymous and not persisted anywhere beyond
 * the rate-limit counter (spec §5, stateless).
 */
export function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "anonymous";
}

export interface LimitResult {
  ok: boolean;
  reason?: "rate-limit" | "session-cap";
  message?: string;
  /** Seconds until the window resets, when known. */
  retryAfter?: number;
}

const OK: LimitResult = { ok: true };

/** Per-IP sliding window. Fails open if Redis is unreachable. */
export async function checkRateLimit(clientId: string): Promise<LimitResult> {
  const rateLimiter = getLimiter();
  if (!rateLimiter) return OK;

  try {
    const { success, reset } = await rateLimiter.limit(clientId);
    if (success) return OK;

    return {
      ok: false,
      reason: "rate-limit",
      message:
        "You've reached the demo limit for this hour. The agent is capped to keep it cheap to run — everything else on the page still works, and the answers already on screen stay put.",
      retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (error) {
    // A rate-limiter outage must not take the agent down with it.
    console.warn(
      "[ratelimit] check failed, allowing request:",
      error instanceof Error ? error.message : error,
    );
    return OK;
  }
}

/** Per-session message cap, derived from the submitted thread length. */
export function checkSessionCap(userMessageCount: number): LimitResult {
  if (userMessageCount <= SESSION_MESSAGE_CAP) return OK;

  return {
    ok: false,
    reason: "session-cap",
    message: `That's ${SESSION_MESSAGE_CAP} questions in this session — the demo cap. Refresh to start a new one, or email Chris directly if you want to go deeper.`,
  };
}
