# Chris Pollard — Portfolio + Live Agent

A recruiter-facing portfolio site whose centrepiece is a **live agent** visitors can ask about Chris's work — grounded in a curated corpus, cited, with the agent's reasoning shown in a live trace panel. Positioning: **AI Delivery Lead** (hands-on engineer with a decade of delivery).

Built to demonstrate LLM engineering by being one: the same patterns (agent loop, RAG, tool use, guardrails) that Chris ships in production, at a minimal, serverless footprint.

## Stack

- **Next.js 15** (App Router) · TypeScript (strict) · React 19
- **Vercel AI SDK v6** — `ToolLoopAgent`, `useChat` typed message parts
- **Chat model:** Claude Haiku · **Embeddings:** OpenAI `text-embedding-3-small`
- **Retrieval:** static `embeddings.json` + in-memory cosine, behind a swappable `Retriever` interface (pgvector-ready)
- **Rate limiting:** Upstash Redis · **Deploy:** Vercel
- **State:** stateless and anonymous — no database, no accounts, no cross-session memory

See [`portfolio-build-spec.md`](./portfolio-build-spec.md) for the full implementation spec and [`CLAUDE.md`](./CLAUDE.md) for working conventions.

## Quickstart

```bash
# 1. install
npm install

# 2. env
cp .env.example .env.local   # then fill in the keys

# 3. generate embeddings from the corpus (commit the output)
npx tsx scripts/embed-corpus.ts

# 4. run
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` / `npm run typecheck` | Lint / TS checks |
| `npx tsx scripts/embed-corpus.ts` | Rebuild `data/embeddings.json` from `data/corpus.json` |
| `npx tsx scripts/eval.ts` | Run the groundedness / refusal evals |

## Editing content

All of the agent's knowledge lives in **`data/corpus.json`** (26 chunks). Edit the `text` fields there, then **re-run the embed script** so `data/embeddings.json` reflects the change. Don't hand-edit `embeddings.json`.

Before launch, fill the two placeholders in `corpus.json`:

- `faq-remote` — remote / hybrid / relocation preference
- `faq-availability` — how open you are to new roles

## Deploy

Deploy to Vercel. Set the four environment variables (below) in the project settings. `data/embeddings.json` is committed, so no build-time embedding call is needed.

## Environment

See [`.env.example`](./.env.example). Missing keys degrade gracefully — the static site still renders and the agent shows a calm "unavailable" notice rather than erroring.
