import { createAgentUIStreamResponse } from "ai";
import { portfolioAgent } from "@/lib/agent";
import {
  MAX_INPUT_CHARS,
  MAX_THREAD_MESSAGES,
  getCapabilities,
} from "@/lib/config";
import {
  checkRateLimit,
  checkSessionCap,
  getClientId,
} from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Shape the client renders as a calm notice rather than an error. */
function notice(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return Response.json(
    { type: "notice", message, ...extra },
    {
      status,
      headers: extra?.retryAfter
        ? { "Retry-After": String(extra.retryAfter) }
        : undefined,
    },
  );
}

interface IncomingMessage {
  role?: string;
  parts?: Array<{ type?: string; text?: string }>;
}

/**
 * OpenRouter's usage accounting, if present. Shape is provider-defined and not
 * typed by the SDK, so read it defensively — a logging line must never be able
 * to take the stream down.
 */
function readOpenRouterUsage(metadata: unknown) {
  if (typeof metadata !== "object" || metadata === null) return undefined;
  const openrouter = (metadata as Record<string, unknown>).openrouter;
  if (typeof openrouter !== "object" || openrouter === null) return undefined;
  const usage = (openrouter as Record<string, unknown>).usage;
  if (typeof usage !== "object" || usage === null) return undefined;

  const record = usage as Record<string, unknown>;
  const promptDetails = record.promptTokensDetails;
  const cachedTokens =
    typeof promptDetails === "object" && promptDetails !== null
      ? (promptDetails as Record<string, unknown>).cachedTokens
      : undefined;

  return {
    promptTokens: record.promptTokens,
    completionTokens: record.completionTokens,
    cachedTokens,
    costUsd: record.cost,
  };
}

export async function POST(request: Request) {
  // ---- Guardrails run before anything streams (spec §5). ----

  const capabilities = getCapabilities();
  if (!capabilities.chat) {
    return notice(
      "The live agent is offline right now — no API key is configured for this deployment. Everything else on this page is real and complete; the sections below cover the same ground the agent would.",
      503,
    );
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return notice("That request didn't parse. Try asking again.", 400);
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return notice("No question received. Try asking again.", 400);
  }

  if (messages.length > MAX_THREAD_MESSAGES) {
    return notice(
      "This conversation has got long enough that it's time for a fresh one. Refresh the page to start over.",
      400,
    );
  }

  const userMessages = (messages as IncomingMessage[]).filter(
    (message) => message?.role === "user",
  );

  const sessionCap = checkSessionCap(userMessages.length);
  if (!sessionCap.ok) {
    return notice(sessionCap.message ?? "Demo limit reached.", 429);
  }

  // Reject oversized input before it costs a model call. Long pasted blobs are
  // the usual shape of an injection attempt as well as a cost problem.
  const latest = userMessages.at(-1);
  const latestText = (latest?.parts ?? [])
    .filter((part) => part?.type === "text")
    .map((part) => part.text ?? "")
    .join(" ");

  if (latestText.length > MAX_INPUT_CHARS) {
    return notice(
      `That question is longer than this demo accepts (${MAX_INPUT_CHARS} characters). Try a shorter one.`,
      400,
    );
  }

  const rateLimit = await checkRateLimit(getClientId(request));
  if (!rateLimit.ok) {
    return notice(rateLimit.message ?? "Demo limit reached.", 429, {
      retryAfter: rateLimit.retryAfter,
    });
  }

  // ---- Guardrails passed: stream. ----

  try {
    return await createAgentUIStreamResponse({
      agent: portfolioAgent,
      uiMessages: messages,
      onStepFinish: ({ usage, toolCalls, providerMetadata }) => {
        // Cost-cap logging (spec §5). The chat model sets `usage: { include: true }`,
        // so OpenRouter returns cached-token detail and the real USD cost here.
        // No PII, no visitor id.
        console.log(
          JSON.stringify({
            at: "chat.step",
            tools: toolCalls.map((call) => call.toolName),
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            totalTokens: usage.totalTokens,
            openrouter: readOpenRouterUsage(providerMetadata),
          }),
        );
      },
      onError: (error) => {
        console.error("[chat] stream error:", error);
        return "The agent hit a problem answering that. The rest of the page is unaffected — try another question.";
      },
    });
  } catch (error) {
    console.error("[chat] failed to start stream:", error);
    return notice(
      "The agent couldn't start just now. Everything else on this page still works — try again in a moment.",
      503,
    );
  }
}
