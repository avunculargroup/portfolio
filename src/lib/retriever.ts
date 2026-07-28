/**
 * Retrieval behind a single interface.
 *
 * `staticRetriever` is the provided implementation: loads `embeddings.json` and
 * ranks by cosine similarity plus a small tag boost. `lexicalRetriever` is a
 * dependency-free fallback used when embeddings haven't been generated yet or
 * `OPENAI_API_KEY` is absent — it keeps the agent grounded (and the site
 * demonstrable) instead of failing hard (spec §5, graceful degradation).
 *
 * Swap point: implement the same `Retriever` interface with pgvector later,
 * with no caller changes.
 */
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { EMBEDDING_MODEL, RETRIEVAL_TOP_K } from "@/lib/config";
import { CORPUS, type Chunk, type Hit } from "@/lib/corpus";
import embeddingsJson from "@/data/embeddings.json";

export type { Chunk, Hit } from "@/lib/corpus";

export interface Retriever {
  search(query: string, k?: number): Promise<Hit[]>;
}

type Stored = Chunk & { embedding: number[] };

const STORED = embeddingsJson as Stored[];

/** Embeddings are usable only if they exist and every row actually has one. */
const HAS_EMBEDDINGS =
  Array.isArray(STORED) &&
  STORED.length > 0 &&
  STORED.every((c) => Array.isArray(c.embedding) && c.embedding.length > 0);

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const ai = a[i] as number;
    const bi = b[i] as number;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

/** Lightweight keyword boost — a nod to the hybrid search in the real system. */
function tagBoost(query: string, chunk: Chunk): number {
  const q = query.toLowerCase();
  const hits = (chunk.tags ?? []).filter((t) =>
    q.includes(t.toLowerCase()),
  ).length;
  return Math.min(hits * 0.02, 0.06);
}

export const staticRetriever: Retriever = {
  async search(query, k = RETRIEVAL_TOP_K) {
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: query,
    });

    return STORED.map((chunk) => ({
      ...chunk,
      score: cosine(embedding, chunk.embedding) + tagBoost(query, chunk),
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(({ embedding: _embedding, ...rest }) => rest);
  },
};

/* -------------------------------------------------------------------------- */
/* Lexical fallback (BM25)                                                     */
/* -------------------------------------------------------------------------- */

const STOP_WORDS = new Set([
  "the", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
  "he", "him", "his", "she", "her", "they", "them", "it", "its", "to", "of",
  "in", "on", "at", "by", "for", "with", "about", "as", "from", "that", "this",
  "these", "those", "what", "which", "who", "whom", "how", "when", "where",
  "why", "does", "do", "did", "has", "have", "had", "can", "could", "would",
  "should", "will", "shall", "may", "you", "we", "us", "me", "my", "your",
  "our", "any", "much", "there", "here", "if", "then", "than", "so", "not",
  "yes", "get", "got", "tell", "give", "know",
]);

/*
 * Recruiters ask in their own vocabulary ("where has he worked", "what's he
 * good at"), which doesn't always share surface terms with the corpus. Mapping
 * intent words onto corpus tag vocabulary is the lexical stand-in for the
 * semantic step — expansions are added alongside the original terms, never
 * instead of them, so a literal match still wins on IDF.
 */
const SYNONYMS: Record<string, string[]> = {
  work: ["experience", "employer", "role"],
  worked: ["experience", "employer", "role"],
  working: ["experience", "employer", "role"],
  job: ["experience", "role"],
  jobs: ["experience", "role"],
  employer: ["experience"],
  employed: ["experience"],
  company: ["experience", "employer"],
  companies: ["experience", "employer"],
  career: ["experience", "history"],
  history: ["experience"],
  background: ["experience", "profile"],
  hire: ["availability"],
  hiring: ["availability"],
  available: ["availability"],
  studied: ["education", "degree"],
  study: ["education", "degree"],
  qualification: ["education", "degree"],
  qualifications: ["education", "degree"],
  skill: ["skills", "stack"],
  skills: ["stack"],
  tech: ["stack", "skills"],
  technology: ["stack", "skills"],
  guardrail: ["safety", "approval"],
  guardrails: ["safety", "approval"],
  hallucination: ["safety", "grounding"],
  documentation: ["docs", "specifications", "process"],
  document: ["docs", "process"],
  documenting: ["docs", "process"],
  testing: ["evals", "ci", "tests"],
  test: ["evals", "ci"],
  tests: ["evals", "ci"],
  quality: ["evals", "ci", "process"],
  process: ["ways", "practice"],
  approach: ["ways", "practice", "process"],
  senior: ["seniority", "experience"],
  lead: ["delivery", "leadership"],
  leadership: ["delivery"],
  manage: ["delivery", "management"],
  managed: ["delivery", "management"],
  team: ["delivery", "mentoring"],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

/** Very small vocabulary — light stemming is enough to bridge plural/tense. */
function stem(token: string): string {
  return token.replace(/(ing|edly|ed|ly|es|s)$/, "").replace(/i$/, "y");
}

/** Expand a raw query into stemmed terms plus any intent synonyms. */
function expandQuery(query: string): string[] {
  const raw = tokenize(query);
  const expanded = raw.flatMap((token) => [token, ...(SYNONYMS[token] ?? [])]);
  return expanded.map(stem);
}

interface Indexed {
  chunk: Chunk;
  terms: Map<string, number>;
  length: number;
}

const INDEX: Indexed[] = CORPUS.map((chunk) => {
  const tokens = [
    // Title and tags carry intent, so they're weighted by repetition.
    ...tokenize(chunk.title),
    ...tokenize(chunk.title),
    ...(chunk.tags ?? []).flatMap((tag) => tokenize(tag)),
    ...(chunk.tags ?? []).flatMap((tag) => tokenize(tag)),
    ...tokenize(chunk.category),
    ...tokenize(chunk.text),
  ].map(stem);

  const terms = new Map<string, number>();
  for (const token of tokens) {
    terms.set(token, (terms.get(token) ?? 0) + 1);
  }
  return { chunk, terms, length: tokens.length };
});

const AVG_LENGTH =
  INDEX.reduce((sum, doc) => sum + doc.length, 0) / (INDEX.length || 1);

const DOC_FREQUENCY = (() => {
  const df = new Map<string, number>();
  for (const doc of INDEX) {
    for (const term of doc.terms.keys()) {
      df.set(term, (df.get(term) ?? 0) + 1);
    }
  }
  return df;
})();

/** Okapi BM25. */
function bm25(queryTerms: string[], doc: Indexed): number {
  const k1 = 1.5;
  const b = 0.75;
  const N = INDEX.length;
  let score = 0;

  for (const term of queryTerms) {
    const tf = doc.terms.get(term);
    if (!tf) continue;
    const df = DOC_FREQUENCY.get(term) ?? 0;
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    const denominator = tf + k1 * (1 - b + (b * doc.length) / AVG_LENGTH);
    score += idf * ((tf * (k1 + 1)) / denominator);
  }

  return score;
}

export const lexicalRetriever: Retriever = {
  async search(query, k = RETRIEVAL_TOP_K) {
    const queryTerms = expandQuery(query);
    if (queryTerms.length === 0) return [];

    const scored = INDEX.map((doc) => ({
      chunk: doc.chunk,
      raw: bm25(queryTerms, doc),
    })).filter((entry) => entry.raw > 0);

    if (scored.length === 0) return [];

    // Squash BM25 into a bounded 0..1 range so the score thresholds downstream
    // behave the same way they do for cosine similarity.
    const max = Math.max(...scored.map((entry) => entry.raw));
    return scored
      .sort((a, b) => b.raw - a.raw)
      .slice(0, k)
      .map((entry) => ({
        ...entry.chunk,
        score: max > 0 ? entry.raw / max : 0,
      }));
  },
};

/* -------------------------------------------------------------------------- */

/** True when semantic retrieval is actually available for this request. */
export function hasSemanticRetrieval(): boolean {
  return HAS_EMBEDDINGS && Boolean(process.env.OPENAI_API_KEY);
}

/**
 * The retriever every caller should use. Prefers embeddings; falls back to
 * lexical search when they're unavailable, and again if an embedding call
 * fails at request time (rate limit, outage) so answers stay grounded.
 */
export const retriever: Retriever = {
  async search(query, k = RETRIEVAL_TOP_K) {
    if (hasSemanticRetrieval()) {
      try {
        return await staticRetriever.search(query, k);
      } catch (error) {
        console.warn(
          "[retriever] embedding search failed, falling back to lexical:",
          error instanceof Error ? error.message : error,
        );
      }
    }
    return lexicalRetriever.search(query, k);
  },
};
