/**
 * Build step: corpus.json -> embeddings.json
 * Run:  npx tsx scripts/embed-corpus.ts
 * Requires OPENROUTER_API_KEY in the environment.
 */
import "dotenv/config"; // must stay first so the key is loaded before any request
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { embedMany } from "ai";
import { embeddingModel, EMBEDDING_MODEL } from "../src/lib/openrouter";

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
  const { chunks } = JSON.parse(readFileSync(IN, "utf8")) as { chunks: Chunk[] };

  // Prepend the title so each embedding carries a little context.
  const values = chunks.map((c) => `${c.title}\n\n${c.text}`);

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values,
  });

  const out = chunks.map((c, i) => ({ ...c, embedding: embeddings[i] }));
  writeFileSync(OUT, JSON.stringify(out));
  console.log(`Embedded ${out.length} chunks with ${EMBEDDING_MODEL} -> ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
