/**
 * Records a realistic agent SSE stream to a fixture file, using a mock model
 * and the REAL tools/retriever. Used by the UI replay check so the dossier,
 * citations and trace panel can be verified without an API key.
 *
 * Run:  npx tsx scripts/record-stream.ts > /tmp/stream.sse
 */
import type {
  LanguageModelV3FinishReason,
  LanguageModelV3StreamPart,
  LanguageModelV3Usage,
} from "@ai-sdk/provider";
import { MockLanguageModelV3, simulateReadableStream } from "ai/test";
import { createAgentUIStreamResponse, stepCountIs, ToolLoopAgent } from "ai";
import { SYSTEM_PROMPT } from "../src/lib/agent";
import { portfolioTools } from "../src/lib/tools";
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


const ANSWER =
  "Yes — retrieval is central to business-mono, and it goes past a single vector lookup. " +
  "The knowledge base runs hybrid search: pgvector HNSW similarity, graph traversal across " +
  "knowledge connections, and Postgres full-text.[1] It's wired into a live production system " +
  "that Chris built and ships solo.[2]";

let step = 0;

const model = new MockLanguageModelV3({
  doStream: async () => {
    step += 1;

    if (step === 1) {
      return {
        stream: simulateReadableStream<LanguageModelV3StreamPart>({
          chunks: [
            { type: "stream-start" as const, warnings: [] },
            { type: "response-metadata" as const, id: "r1", modelId: "mock" },
            {
              type: "tool-call" as const,
              toolCallId: "call_1",
              toolName: "searchExperience",
              input: JSON.stringify({ query: "production RAG and retrieval" }),
            },
            {
              type: "finish" as const,
              finishReason: finish("tool-calls"),
              usage: usage(120, 18),
            },
          ],
        }),
      };
    }

    // Stream the answer in word-sized deltas so the replay looks live.
    const words = ANSWER.split(" ");
    return {
      stream: simulateReadableStream<LanguageModelV3StreamPart>({
        chunkDelayInMs: 8,
        chunks: [
          { type: "stream-start" as const, warnings: [] },
          { type: "response-metadata" as const, id: "r2", modelId: "mock" },
          { type: "text-start" as const, id: "t1" },
          ...words.map((word, index) => ({
            type: "text-delta" as const,
            id: "t1",
            delta: index === 0 ? word : ` ${word}`,
          })),
          { type: "text-end" as const, id: "t1" },
          {
            type: "finish" as const,
            finishReason: finish("stop"),
            usage: usage(420, 96),
          },
        ],
      }),
    };
  },
});

const agent = new ToolLoopAgent({
  id: "portfolio-agent-fixture",
  model,
  instructions: SYSTEM_PROMPT,
  tools: portfolioTools,
  maxOutputTokens: MAX_OUTPUT_TOKENS,
  stopWhen: stepCountIs(MAX_STEPS),
});

async function main() {
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

  process.stdout.write(await response.text());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
