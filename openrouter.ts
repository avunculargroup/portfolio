/**
 * OpenRouter — the single gateway for both chat and embeddings.
 *
 * One key (OPENROUTER_API_KEY), one bill. The API key is read lazily from the
 * environment at request time, so importing this module never throws when the
 * key is absent — the caller degrades gracefully instead (spec §5).
 *
 * Server-only. Never import this from a client component.
 */
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/** Chat model. Verify slugs at https://openrouter.ai/models before changing. */
export const CHAT_MODEL = "anthropic/claude-haiku-4.5";

/**
 * Embedding model. Both sides of retrieval — the build-time corpus embeddings
 * and the query-time embedding — MUST use this same constant. Changing it
 * invalidates data/embeddings.json; re-run scripts/embed-corpus.ts after.
 */
export const EMBEDDING_MODEL = "openai/text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

export const openrouter = createOpenRouter({
  // apiKey omitted on purpose — the provider reads OPENROUTER_API_KEY per request.
  appName: "Chris Pollard — Portfolio Agent",
  appUrl: process.env.SITE_URL,
});

/**
 * `usage.include` returns OpenRouter's usage accounting on the response:
 * prompt/completion tokens, cached-token detail, and actual cost in USD.
 * Read it from providerMetadata.openrouter.usage for the cost cap log (spec §5).
 */
export const chatModel = openrouter.chat(CHAT_MODEL, {
  usage: { include: true },
});

/**
 * Pinned to OpenAI with fallbacks off. This is deliberate and load-bearing:
 * OpenRouter's default routing may serve an embedding request from a different
 * upstream, which would return vectors in a different space and silently wreck
 * retrieval against the committed embeddings.json. Do not relax this.
 */
export const embeddingModel = openrouter.textEmbeddingModel(EMBEDDING_MODEL, {
  provider: { only: ["openai"], allow_fallbacks: false },
});
