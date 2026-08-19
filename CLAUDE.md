# CLAUDE.md — working conventions

Project conventions for building and maintaining this repo. Read alongside `portfolio-build-spec.md` (the full spec) and `README.md`. This file captures the things that are easy to get wrong.

## What this is

A recruiter-facing portfolio for **Chris Pollard**, positioned as a **Technical Product Lead — AI** — a hands-on engineer who takes LLM agents from demo to production, with a decade of delivery behind it. (The earlier "AI delivery lead" framing was retired in the August 2026 copy pass: it read as "manager who doesn't build", the opposite of the argument this site makes.) Its centrepiece is a live agent that answers questions about Chris, grounded in `data/corpus.json` and cited, with the trace of its tool loop shown inline under the answer. Stateless and anonymous.

## Non-negotiables

1. **Never fabricate facts about Chris.** Everything the agent says must be supported by a retrieved corpus chunk. If the corpus doesn't cover something, the agent says so — it does not guess employers, dates, titles, or claims. This is a real person's professional reputation.
2. **Always cite.** Answers reference the corpus chunks they draw from. No ungrounded assertions.
3. **Stateless.** No database, no accounts, no cross-session memory, no visitor tracking beyond privacy-friendly, cookieless analytics. Don't add persistence "to be helpful."
4. **Guardrails ship with the endpoint, not later.** Scope-lock, rate limit, cost cap, graceful degradation must exist before this is called done (spec §5).
5. **The site stands alone.** If the agent/keys are unavailable, every section still renders and the console shows a calm notice — never a raw error or a blank hero.

## Voice & copy

- Static site copy (hero, case study, timeline, footer) is **first-person** — Chris speaking for himself, warm and conversational, no hype.
- The agent itself answers in **third person** ("Chris built…"), per its own system prompt in `lib/agent.ts` — don't make it speak as Chris.
- Positioning through-line: builds the system *and* leads the delivery. "A human at the edge of every automated decision" is Chris's own phrase — fine to use, don't overuse.
- Don't inflate: the AI-leadership claim rests on a solo build, not on leading a team. Keep copy defensible in an interview (see spec §4 / the delivery-lead framing).

## Design (redesigned 2026 — warm/nature palette)

The original spec (§7) and `portfolio-demo.html` describe the first version of this site: a dark amber "dossier vs instrument" concept. It has been superseded by a warm, human redesign — paper neutrals + one eucalyptus/sage-olive accent, nature/Melbourne-bush inspired. The tokens below are now the fixed ones; treat spec §7's amber/dark-panel tokens as historical.

- Tokens (`src/app/globals.css`): `--ink`, `--paper`, `--paper-2` (warm neutrals), `--tint` (light sage), `--moss` (dark section bg — contact/footer only), `--line`, `--muted`, `--signal` / `--signal-dk` (the one accent, sage-olive), `--signal-soft`. No dark "instrument" panel anywhere anymore — the agent trace is a plain warm card, not a terminal.
- Type roles: **Newsreader** (serif — headings, italic pull-quotes) + **Manrope** (sans — everything else: body, UI, labels). No mono typeface; the old JetBrains Mono "trace/label" role is gone along with the terminal aesthetic. Load via `next/font` — **no runtime external font fetch** (this also avoids a class of blank-render bugs).
- Concept: a calm, warm editorial page. The live agent Q&A reads as a real card, not an "instrument" — the "How I got there" trace sits inline below the answer, in the same card, not a separate dark panel.

## Mobile-first

- The header was the known weak point — implement the disclosure-menu pattern in spec §6.1 exactly (collapse to brand + name + menu button below `md`; hide the role subtitle and "Live agent" tag; accessible open/close).
- The agent trace renders inline below the answer inside the same card (no separate Answer/Trace tab control) — the answer is first in reading order on every breakpoint, so it can never be buried.
- Min tap target 44×44px; inputs `font-size:16px`; honour safe-area insets; test from 320px up; nothing clips or overflows.
- `prefers-reduced-motion`: disable typewriter streaming, step-rise, and header slide; keep everything usable.

## Engineering conventions

- TypeScript strict. Keep tunables (token/step caps, rate limits) in `lib/config.ts`, not scattered.
- **Providers:** everything goes through **OpenRouter** — chat *and* embeddings, one `OPENROUTER_API_KEY`. No direct Anthropic or OpenAI keys. All provider setup lives in `lib/openrouter.ts`; don't construct a provider anywhere else.
- **Model ids:** don't guess. Both slugs are constants in `lib/openrouter.ts`; verify against https://openrouter.ai/models before changing.
- **Never unpin the embedding provider.** `embeddingModel` is pinned to the OpenAI upstream with `allow_fallbacks: false`. Letting OpenRouter route it elsewhere returns vectors in a different space and silently breaks retrieval — a failure that looks like "the agent got worse", not like an error.
- **Retrieval:** always go through the `Retriever` interface. The static implementation is provided; a pgvector implementation must be a drop-in with no caller changes.
- **Corpus is the source of truth.** To change what the agent knows, edit `data/corpus.json` and re-run `scripts/embed-corpus.ts`. Never hand-edit `data/embeddings.json`. Ignore `_`-prefixed keys in the corpus.
- **Starter prompts live in `lib/config.ts`** (`ASK_PROMPTS`), not inline in `AskConsole` — they are the highest-leverage copy on the page and get tuned often. Every prompt needs a matching retrieval eval in `scripts/eval.ts`; the same rule already applies to the `Signposts` queries.
- Prefer small, composable components (spec §2). Server components by default; client components only where interactivity needs them (console, trace panel).
- No secrets in client code. `OPENROUTER_API_KEY` is server-only; `lib/openrouter.ts` must never be imported from a client component.

## Definition of done

Work against the checklist in spec §12. Key gates: grounded + cited streaming answers, real trace from typed parts, guardrails enforced, graceful degradation, mobile header + answer-first hero correct, Lighthouse mobile ≥ 95 (perf/a11y), evals pass.

## When unsure

If a requirement here conflicts with something else, the order of authority is: this file first (it documents the current warm/nature redesign), then `portfolio-build-spec.md` for everything unrelated to visual design (the agent, guardrails, structure). `design-reference/portfolio-demo.html` is the *original* dark "dossier" mock and is superseded for look/interaction — it's kept for historical context only. If a decision affects Chris's factual representation or the honesty of the positioning, stop and flag it rather than resolving it silently.
