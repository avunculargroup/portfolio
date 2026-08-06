# Chris Pollard — Portfolio + Live Agent

A recruiter-facing portfolio site whose centrepiece is a **live agent** visitors can ask about Chris's work — grounded in a curated corpus, cited, with the agent's reasoning shown inline as "How I got there." Positioning: **AI Delivery Lead** (hands-on engineer with a decade of delivery).

Built to demonstrate LLM engineering by being one: the same patterns (agent loop, RAG, tool use, guardrails) that Chris ships in production, at a minimal, serverless footprint.

## Stack

- **Next.js 15** (App Router) · TypeScript (strict) · React 19
- **Vercel AI SDK v6** — `ToolLoopAgent`, `useChat` typed message parts
- **Model gateway:** OpenRouter — one key for chat *and* embeddings
- **Chat model:** `anthropic/claude-haiku-4.5` · **Embeddings:** `openai/text-embedding-3-small`
- **Retrieval:** static `embeddings.json` + in-memory cosine, behind a swappable `Retriever` interface (pgvector-ready), with a dependency-free BM25 fallback
- **Rate limiting:** Upstash Redis · **Deploy:** Vercel
- **Styling:** CSS variables + CSS Modules (design tokens are fixed — see spec §7)
- **State:** stateless and anonymous — no database, no accounts, no cross-session memory

See [`portfolio-build-spec.md`](./portfolio-build-spec.md) for the full implementation spec and [`CLAUDE.md`](./CLAUDE.md) for working conventions.

## Quickstart

```bash
# 1. install
npm install

# 2. env
cp .env.example .env.local   # then fill in the keys

# 3. generate embeddings from the corpus (commit the output)
npm run embed

# 4. run
npm run dev
```

Open http://localhost:3000.

> **The site runs with no keys at all.** Every section renders, and the console shows a calm "agent is offline" notice instead of an error. Add `OPENROUTER_API_KEY` to turn the agent on.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | Lint / TS checks |
| `npm run embed` | Rebuild `data/embeddings.json` from `data/corpus.json` |
| `npm run eval` | Groundedness / refusal / injection evals |
| `npm run smoke` | Agent streaming-contract test (mock model, no API key needed) |
| `npm run verify` | typecheck + lint + eval + smoke |
| `npm run ui:checks` | Playwright layout + a11y checks (needs a server on :3210) |
| `npm run ui:replay` | Replays a recorded agent stream through the real UI |
| `npm run record-stream` | Re-records the UI replay fixture |

### Running the UI checks

```bash
npm run build
npx next start -p 3210 &
npm run ui:checks     # 320/390/768/1280 overflow, tap targets, menu, tabs
npm run ui:replay     # dossier + citations + trace panel render from a real stream
```

`ui:replay` needs the page to believe the agent is available, so start the server with any non-empty `OPENROUTER_API_KEY` — the request is intercepted in the browser and never leaves it.

## Retrieval, and the embeddings caveat

Retrieval always goes through the `Retriever` interface in [`src/lib/retriever.ts`](./src/lib/retriever.ts). Two implementations ship:

1. **`staticRetriever`** — the intended path. Cosine similarity over `data/embeddings.json` plus a small tag boost. Requires `OPENROUTER_API_KEY` at query time (to embed the question).
2. **`lexicalRetriever`** — a dependency-free BM25 fallback over the corpus, with a small synonym map for recruiter phrasing.

The exported `retriever` prefers embeddings and falls back to lexical when `embeddings.json` is unbuilt, **out of date with `corpus.json`**, `OPENROUTER_API_KEY` is missing, or an embedding call fails mid-request. This keeps answers grounded rather than failing hard.

The staleness check matters: `staticRetriever` serves the text stored beside each vector, so an `embeddings.json` built before a corpus edit would feed the agent superseded facts and hide new chunks entirely — a failure that reads as "the agent got worse", not as an error. When the two have drifted, the retriever logs a warning and uses lexical search over the live corpus instead.

> ⚠️ **`data/embeddings.json` is stale.** It holds the 26 chunks from the previous corpus; `data/corpus.json` now has 46. It could not be regenerated here because no `OPENROUTER_API_KEY` was available. **Run `npm run embed` and commit the result before deploying** — until then the agent is grounded by the lexical fallback, which passes the retrieval evals (16/16) but is weaker on paraphrased questions than real embeddings.

A pgvector implementation can replace either one with no caller changes.

## Editing content

All of the agent's knowledge lives in **`data/corpus.json`** (46 chunks). Edit the `text` fields there, then **re-run `npm run embed`** so `data/embeddings.json` reflects the change. Don't hand-edit `embeddings.json`. Keys prefixed with `_` are authoring notes and are ignored at runtime.

Both `[bracketed]` placeholders called out in spec §11 (`faq-remote`, `faq-availability`) are already filled in.

## Guardrails

Enforced in [`src/app/api/chat/route.ts`](./src/app/api/chat/route.ts) **before** any streaming starts:

- **Scope-lock + grounding** in the system prompt ([`src/lib/agent.ts`](./src/lib/agent.ts)) — no claim without a retrieved chunk, always cite, refuse off-topic and instruction-override attempts.
- **Rate limit** — Upstash sliding window, 20 requests/hour per IP, plus a 12-message per-session cap. Fails open if Redis is unreachable.
- **Cost cap** — cheap model, `maxOutputTokens` 500, max 6 steps, input length capped. Usage is logged per step from `providerMetadata.openrouter.usage`, which carries cached-token detail and the actual USD cost. Back it with a credit limit on the OpenRouter key.
- **Injection handling** — corpus text and visitor text are treated as data, never instructions. Covered by evals.
- **Graceful degradation** — missing keys or a tripped limit return a friendly JSON notice that the console renders as calm copy, never a raw error.

Limits and caps live in [`src/lib/config.ts`](./src/lib/config.ts); model slugs and provider setup live in [`src/lib/openrouter.ts`](./src/lib/openrouter.ts).

## Deploy

Deploy to Vercel. Set the environment variables (below) in the project settings. `data/embeddings.json` is committed, so no build-time embedding call is needed.

## Environment

See [`.env.example`](./.env.example) — `OPENROUTER_API_KEY` plus the two Upstash values. Missing keys degrade gracefully: the static site still renders and the agent shows a calm "unavailable" notice rather than erroring.

Both the chat model and the embedding model are reached through OpenRouter, configured in `src/lib/openrouter.ts`. Two things there are load-bearing:

- The embedding model is **pinned to the OpenAI upstream with fallbacks disabled**. If OpenRouter routed an embedding call elsewhere, the returned vectors would live in a different space and retrieval against the committed `embeddings.json` would quietly degrade.
- `scripts/embed-corpus.ts` and the query-time retriever both import the same `embeddingModel`, so the corpus and the query can't drift apart. If you change the model, re-run the embed script.

Pin `@openrouter/ai-sdk-provider@^2.10.0` — the `3.x` line requires AI SDK v7, and this project is on v6.
