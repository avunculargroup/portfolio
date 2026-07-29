/**
 * Build step: corpus.json -> embeddings.json
 * Run:  npx tsx scripts/embed-corpus.ts
 * Requires OPENROUTER_API_KEY in the environment.
 *
 * The output is committed so the deploy needs no build-time embedding call.
 * Never hand-edit data/embeddings.json — edit data/corpus.json and re-run this.
 */
import "dotenv/config"; // must stay first so the key is loaded before any request
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { embedMany } from "ai";
import {
  embeddingModel,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
} from "../src/lib/openrouter";

type Chunk = {
  id: string;
  title: string;
  category: string;
  url: string;
  text: string;
  tags?: string[];
};

const IN = resolve("data/corpus.json");
const OUT = resolve("data/embeddings.json");

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error(
      "OPENROUTER_API_KEY is not set. Copy .env.example to .env.local and fill it in.",
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
    model: embeddingModel,
    values,
  });

  const wrongSize = embeddings.findIndex(
    (e) => e.length !== EMBEDDING_DIMENSIONS,
  );
  if (wrongSize !== -1) {
    console.error(
      `Unexpected embedding size at index ${wrongSize}: got ${embeddings[wrongSize]?.length}, expected ${EMBEDDING_DIMENSIONS}.`,
    );
    process.exit(1);
  }

  const out = chunks.map((c, i) => ({ ...c, embedding: embeddings[i] }));
  writeFileSync(OUT, JSON.stringify(out));
  console.log(
    `Embedded ${out.length} chunks (${EMBEDDING_DIMENSIONS}d, ${EMBEDDING_MODEL}) -> ${OUT}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
