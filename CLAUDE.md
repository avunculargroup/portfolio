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

## Design (2026 — warm paper + terracotta)

`src/app/globals.css` is the source of truth for tokens; if this section and that file disagree, the file wins and this section should be fixed.

History, so old references don't mislead:
1. **Original (July 2026)** — dark amber "dossier vs instrument": Space Grotesk / Source Serif 4 / JetBrains Mono, a dark trace panel. Described by spec §7 and `design-reference/portfolio-demo.html`. Retired.
2. **Warm/nature redesign (early August 2026)** — paper neutrals with a eucalyptus/sage-olive accent and a dark moss contact band. `design-reference/warm-redesign-2026.dc.html` is this version. Retired: its sage accent and dark band are gone.
3. **Current (mid-August 2026)** — the same warm structure repainted terracotta-on-paper, with a light contact panel. This is what's live.

- **Tokens** (`globals.css`): `--ink` (warm near-black), `--paper` (page background), `--paper-2` (cards, footer, header), `--line`, `--muted`; one accent: `--signal` (terracotta, hue ~40) and `--signal-dk` (deeper terracotta, for text: eyebrows, links, labels); `--signal-soft` and `--tint` (light terracotta tint: chips, selection, soft fills); `--radius` 12px.
- **No dark surfaces anywhere.** `--moss` keeps its old name but is now the same light tint as `--tint`; it is the contact section's background, with `--panel-text` / `--panel-text-dim` (= ink / muted) on it. The footer sits on `--paper-2`. The agent trace is a plain warm card, not a terminal.
- **Accent rules:** `--signal` for marks and fills — dots, rules and borders, focus rings, primary buttons; `--signal-dk` when the accent is text, for contrast. Don't add a second accent. `--ok` is defined but unused.
- **Type roles:** **Newsreader** (serif — headings, italic pull-quotes) + **Manrope** (sans — everything else: body, UI, labels). No mono typeface. Both are vendored as variable woff2 in `src/app/fonts` and loaded with `next/font/local` — **no external font fetch at runtime or build time** (avoids blank renders and gstatic-blip deploy failures).
- **Concept:** a calm, warm editorial page. The live agent Q&A reads as a real card — the "How I got there" trace sits inline below the answer, in the same card, not a separate panel.

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

If a requirement here conflicts with something else, the order of authority is: this file first (it documents the current terracotta-on-paper design, with `globals.css` as the token source of truth), then `portfolio-build-spec.md` for everything unrelated to visual design (the agent, guardrails, structure). Both files in `design-reference/` are superseded for look/interaction — `portfolio-demo.html` (the original dark "dossier" mock) and `warm-redesign-2026.dc.html` (the sage-accent version) — and kept for historical context only. If a decision affects Chris's factual representation or the honesty of the positioning, stop and flag it rather than resolving it silently.
