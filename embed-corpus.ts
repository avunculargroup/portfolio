/**
 * Build step: corpus.json -> embeddings.json
 * Run:  npx tsx scripts/embed-corpus.ts
 * Requires OPENAI_API_KEY in the environment.
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

const IN = resolve("data/corpus.json");
const OUT = resolve("data/embeddings.json");

async function main() {
  const { chunks } = JSON.parse(readFileSync(IN, "utf8")) as { chunks: Chunk[] };

  // Prepend the title so each embedding carries a little context.
  const values = chunks.map((c) => `${c.title}\n\n${c.text}`);

  const { embeddings } = await embedMany({
    model: openai.embedding("text-embedding-3-small"),
    values,
  });

  const out = chunks.map((c, i) => ({ ...c, embedding: embeddings[i] }));
  writeFileSync(OUT, JSON.stringify(out));
  console.log(`Embedded ${out.length} chunks -> ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
