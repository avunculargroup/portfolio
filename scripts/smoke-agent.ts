/**
 * Integration smoke test for the agent's streaming contract.
 * Run:  npx tsx scripts/smoke-agent.ts
 *
 * Uses a mock language model so it needs no API key. It verifies the wiring the
 * trace panel depends on: that a real tool call surfaces as a typed
 * `tool-searchExperience` UI part with an output payload the trace can read,
 * and that the answer text streams alongside it.
 */
import type {
  LanguageModelV3FinishReason,
  LanguageModelV3StreamPart,
  LanguageModelV3Usage,
} from "@ai-sdk/provider";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import {
  asSchema,
  createAgentUIStreamResponse,
  stepCountIs,
  ToolLoopAgent,
} from "ai";
import { SYSTEM_PROMPT } from "../src/lib/agent";
import { PITCH_SCHEMA, portfolioTools } from "../src/lib/tools";
import { collectSources, collectTrace } from "../src/lib/trace";
import { MAX_OUTPUT_TOKENS, MAX_STEPS } from "../src/lib/config";

/** LanguageModelV3 reports token usage as structured objects, not bare numbers. */
function usage(input: number, output: number): LanguageModelV3Usage {
  return {
    inputTokens: {
      total: input,
      noCache: input,
      cacheRead: undefined,
      cacheWrite: undefined,
    },
    outputTokens: { total: output, text: output, reasoning: undefined },
  };
}

/** LanguageModelV3 reports the finish reason as a unified/raw pair. */
function finish(
  unified: LanguageModelV3FinishReason["unified"],
): LanguageModelV3FinishReason {
  return { unified, raw: unified };
}


const TOOL_CALL_ID = "call_1";
let step = 0;

const model = new MockLanguageModelV3({
  doStream: async () => {
    step += 1;

    // Step 1: the agent calls search_experience.
    if (step === 1) {
      return {
        stream: simulateReadableStream<LanguageModelV3StreamPart>({
          chunks: [
            { type: "stream-start" as const, warnings: [] },
            { type: "response-metadata" as const, id: "r1", modelId: "mock" },
            {
              type: "tool-call" as const,
              toolCallId: TOOL_CALL_ID,
              toolName: "searchExperience",
              input: JSON.stringify({ query: "production RAG experience" }),
            },
            {
              type: "finish" as const,
              finishReason: finish("tool-calls"),
              usage: usage(10, 5),
            },
          ],
        }),
      };
    }

    // Step 2: the agent answers, citing the retrieved chunks.
    return {
      stream: simulateReadableStream<LanguageModelV3StreamPart>({
        chunks: [
          { type: "stream-start" as const, warnings: [] },
          { type: "response-metadata" as const, id: "r2", modelId: "mock" },
          { type: "text-start" as const, id: "t1" },
          {
            type: "text-delta" as const,
            id: "t1",
            delta: "Yes — retrieval is central to business-mono.[1] ",
          },
          {
            type: "text-delta" as const,
            id: "t1",
            delta: "It runs hybrid search over pgvector.[2]",
          },
          { type: "text-end" as const, id: "t1" },
          {
            type: "finish" as const,
            finishReason: finish("stop"),
            usage: usage(20, 18),
          },
        ],
      }),
    };
  },
});

const agent = new ToolLoopAgent({
  id: "portfolio-agent-smoke",
  model,
  instructions: SYSTEM_PROMPT,
  tools: portfolioTools,
  maxOutputTokens: MAX_OUTPUT_TOKENS,
  stopWhen: stepCountIs(MAX_STEPS),
});

const failures: string[] = [];

function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  \x1b[32mPASS\x1b[0m  ${name}`);
  } else {
    console.log(`  \x1b[31mFAIL\x1b[0m  ${name}`);
    if (detail) console.log(`        \x1b[2m${detail}\x1b[0m`);
    failures.push(name);
  }
}

/**
 * The pitch schema has to survive the strictest structured-output dialect it
 * might meet: every property in `required`, no array bounds, no optional keys.
 * A schema that violates this is rejected outright by strict json_schema modes,
 * which is what broke draft_pitch — it failed on every call, not intermittently.
 */
async function checkPitchSchemaIsPortable() {
  const schema = (await asSchema(PITCH_SCHEMA).jsonSchema) as {
    properties?: Record<string, unknown>;
    required?: string[];
  };

  const properties = Object.keys(schema.properties ?? {});
  const required = schema.required ?? [];
  const missing = properties.filter((key) => !required.includes(key));

  check(
    "pitch schema marks every property required",
    missing.length === 0,
    `optional in strict mode: ${missing.join(", ")}`,
  );

  const serialised = JSON.stringify(schema);
  const bounds = ["minItems", "maxItems", "uniqueItems"].filter((keyword) =>
    serialised.includes(`"${keyword}"`),
  );

  check(
    "pitch schema carries no array-bound keywords",
    bounds.length === 0,
    `unsupported keywords: ${bounds.join(", ")}`,
  );
}

async function main() {
  console.log("Agent streaming contract (mock model)\n");

  const response = await createAgentUIStreamResponse({
    agent,
    uiMessages: [
      {
        id: "m1",
        role: "user",
        parts: [{ type: "text", text: "Has Chris shipped production RAG?" }],
      },
    ],
  });

  check("route returns 200", response.status === 200, `got ${response.status}`);

  const body = await response.text();

  const chunks: Array<Record<string, unknown>> = [];
  for (const line of body.split("\n")) {
    if (!line.startsWith("data: ")) continue;
    const payload = line.slice(6).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      chunks.push(JSON.parse(payload) as Record<string, unknown>);
    } catch {
      /* ignore keep-alives */
    }
  }

  // On the wire the tool call is a generic chunk carrying `toolName`; the
  // client's Chat assembles those into the `tool-searchExperience` part that
  // collectTrace() reads. Assert the wire shape here, the assembled shape below.
  const toolInput = chunks.find(
    (chunk) =>
      chunk.type === "tool-input-available" &&
      chunk.toolName === "searchExperience",
  );
  check(
    "stream carries a search_experience tool call",
    Boolean(toolInput),
    `chunk types: ${chunks.map((c) => c.type).join(", ")}`,
  );

  const toolOutput = chunks.find(
    (chunk) => chunk.type === "tool-output-available",
  );
  check("tool output chunk present", Boolean(toolOutput));

  check(
    "answer text streams",
    body.includes("hybrid search over pgvector"),
    "answer text missing from stream",
  );

  const output = (toolOutput?.output ?? {}) as { hits?: unknown[] };
  const hits = Array.isArray(output.hits) ? output.hits : [];
  check(
    "search_experience returned real corpus chunks",
    hits.length > 0,
    `got ${hits.length} hits`,
  );

  // Feed a synthetic message through the trace derivation used by the UI.
  const uiMessage = {
    id: "a1",
    role: "assistant" as const,
    parts: [
      {
        type: "tool-searchExperience",
        toolCallId: TOOL_CALL_ID,
        state: "output-available",
        input: { query: "production RAG experience" },
        output,
      },
      {
        type: "text" as const,
        text: "Yes — retrieval is central to business-mono.[1]",
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trace = collectTrace(uiMessage as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sources = collectSources(uiMessage as any);

  check(
    "trace panel derives a search_experience step",
    trace.length === 1 && trace[0]?.name === "search_experience",
    JSON.stringify(trace),
  );
  check(
    "trace step is marked done with numbered hits",
    trace[0]?.state === "done" && (trace[0]?.hits?.length ?? 0) > 0,
    JSON.stringify(trace[0]),
  );
  check(
    "citation sources are collected in order",
    sources.length > 0 && typeof sources[0]?.title === "string",
    JSON.stringify(sources.map((s) => s.id)),
  );

  await checkPitchSchemaIsPortable();

  console.log(
    failures.length === 0
      ? "\n\x1b[32mAll streaming-contract checks passed.\x1b[0m"
      : `\n\x1b[31m${failures.length} check(s) failed.\x1b[0m`,
  );
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
