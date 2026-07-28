/**
 * StaticEmbeddingRetriever — loads embeddings.json and ranks by cosine similarity.
 * Swap point: implement the same Retriever interface with pgvector later, no caller changes.
 */
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import embeddings from "@/data/embeddings.json";

export interface Chunk {
  id: string;
  title: string;
  category: string;
  url: string;
  text: string;
  tags?: string[];
}
export type Hit = Chunk & { score: number };

export interface Retriever {
  search(query: string, k?: number): Promise<Hit[]>;
}

type Stored = Chunk & { embedding: number[] };
const CORPUS = embeddings as Stored[];

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// Optional lightweight keyword boost — a nod to the hybrid search in the real system.
function tagBoost(query: string, c: Stored): number {
  const q = query.toLowerCase();
  const hits = (c.tags ?? []).filter((t) => q.includes(t.toLowerCase())).length;
  return Math.min(hits * 0.02, 0.06);
}

export const staticRetriever: Retriever = {
  async search(query, k = 3) {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });

    return CORPUS
      .map((c) => ({ ...c, score: cosine(embedding, c.embedding) + tagBoost(query, c) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(({ embedding: _drop, ...rest }) => rest);
  },
};
