/**
 * The corpus is the single source of truth for everything the agent knows.
 * To change what it knows, edit `data/corpus.json` and re-run
 * `scripts/embed-corpus.ts` (CLAUDE.md → engineering conventions).
 */
import corpusJson from "@/data/corpus.json";

export interface Chunk {
  id: string;
  title: string;
  category: string;
  url: string;
  text: string;
  tags?: string[];
}

export type Hit = Chunk & { score: number };

/** Keys prefixed with `_` are authoring notes and are ignored at runtime. */
export const CORPUS: Chunk[] = (corpusJson as { chunks: Chunk[] }).chunks;

export const CORPUS_SIZE = CORPUS.length;

export function getChunkById(id: string): Chunk | undefined {
  return CORPUS.find((chunk) => chunk.id === id);
}
