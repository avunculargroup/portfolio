/**
 * Build step: corpus.json -> embeddings.json
 * Run:  npx tsx scripts/embed-corpus.ts
 * Requires OPENAI_API_KEY in the environment.
 *
 * The output is committed so the deploy needs no build-time embedding call.
 * Never hand-edit data/embeddings.json — edit data/corpus.json and re-run this.
 */
import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";

type Chunk = {
  id: string;
  title: string;
  category: string;
  url: string;
  text: string;
  tags?: string[];
};

// Kept literal rather than imported from src/ so the script stays runnable
// under plain tsx with no path-alias resolution.
const EMBEDDING_MODEL = "text-embedding-3-small";
const EXPECTED_DIMENSIONS = 1536;

const IN = resolve("data/corpus.json");
const OUT = resolve("data/embeddings.json");

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error(
      "OPENAI_API_KEY is not set. Copy .env.example to .env.local and fill it in.",
    );
    process.exit(1);
  }

  const { chunks } = JSON.parse(readFileSync(IN, "utf8")) as { chunks: Chunk[] };

  const ids = new Set(chunks.map((c) => c.id));
  if (ids.size !== chunks.length) {
    console.error("Duplicate chunk ids in corpus.json — ids must be unique.");
    process.exit(1);
  }

  // Warn rather than fail: an unfinished corpus is still embeddable, but the
  // owner should know a [bracketed] placeholder is about to go live.
  const placeholders = chunks.filter((c) => /\[[^\]]+\]/.test(c.text));
  if (placeholders.length > 0) {
    console.warn(
      `Warning: ${placeholders.length} chunk(s) still contain [bracketed] placeholders: ` +
        placeholders.map((c) => c.id).join(", "),
    );
  }

  // Prepend the title so each embedding carries a little context.
  const values = chunks.map((c) => `${c.title}\n\n${c.text}`);

  const { embeddings } = await embedMany({
    model: openai.embedding(EMBEDDING_MODEL),
    values,
  });

  const wrongSize = embeddings.findIndex(
    (e) => e.length !== EXPECTED_DIMENSIONS,
  );
  if (wrongSize !== -1) {
    console.error(
      `Unexpected embedding size at index ${wrongSize}: got ${embeddings[wrongSize]?.length}, expected ${EXPECTED_DIMENSIONS}.`,
    );
    process.exit(1);
  }

  const out = chunks.map((c, i) => ({ ...c, embedding: embeddings[i] }));
  writeFileSync(OUT, JSON.stringify(out));
  console.log(
    `Embedded ${out.length} chunks (${EXPECTED_DIMENSIONS}d, ${EMBEDDING_MODEL}) -> ${OUT}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
