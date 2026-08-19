# SPEC — portfolio copy, broadening for interface roles

**Repo:** chrispollard.dev
**Raised:** August 2026
**Source:** ten-point review of the live site, plus this session's positioning work
**Companion ticket:** `CHANGE-portfolio-copy-aug2026.md` — factual corrections (RMIT decade, ANZ, availability, email). **Apply that first.** This spec is positioning; that one is accuracy, and accuracy blocks deployment.

---

## Intent

Widen the profile so it reads to four adjacent role families — Technical Product Manager, Solutions Architect, Delivery Lead, Technical Account Manager — without diluting the AI engineering signal that makes it findable in the first place.

**The governing tension:** copy written to appeal to four audiences usually appeals to none. Every change below broadens the *supporting* copy while the primary claims stay specific. Where the review suggested generalising a headline claim, that's flagged and argued rather than silently applied.

**Terminology used throughout:** "interface role" means any role whose value is holding both the client conversation and the build. That's the through-line, not a list of job titles.

---

## S1 · Hero — RESOLVED: Option A

**Current**
> **H1:** I take LLM agents from demo to production.
> **Sub:** Two years embedded with ANZ state government agencies. Now building multi-agent systems solo.

*(The "ANZ" correction is P0-3 in the companion ticket and applies to both options below.)*

### Option A — hold the H1, broaden the sub-line **← SELECTED, implement this**

> **H1:** I take LLM agents from demo to production.
> **Sub:** Two years embedded with Australian state government agencies, running requirements and shipping the result. A decade of product and delivery behind it. This site is one of the systems — ask it something real.

**Argument for.** The H1 is the most specific, most memorable sentence on the site and the only one that makes you searchable for AI work. It states an outcome nobody else on a shortlist can claim as concretely. The broadening happens immediately underneath, where "running requirements," "shipping the result" and "product and delivery" do the interface work without costing the AI signal. A visitor gets the sharp claim first and the range second — which is the order that converts.

**Argument against.** A Delivery Lead or TAM hiring manager may read the H1 and file you as a pure AI engineer before reaching the sub-line.

### Option B — broaden the H1 *(not selected — retained for the record)*

> **H1:** I turn complex requirements into shipped, production-ready systems.
> **Sub:** LLM agents in production, two years embedded with Australian state government agencies, and a decade of product and delivery. This site is one of the systems — ask it something real.

**Argument for.** Explicitly role-agnostic. Reads as easily to a Solutions Architect panel as to an AI team.

**Argument against.** The sentence could describe any senior engineer or delivery manager in the country. It surrenders the one claim that's scarce and replaces it with one that isn't, and it pushes AI down into a list where it competes for attention. For a market where <5% of candidates can honestly claim production LLM work, that's an expensive trade.

**Decision: Option A.** Specificity is the asset. The broadening happens in the sub-line and in the body copy (S2, S5, S6, S7), not in the headline.

### Final hero copy to implement

> **H1:** I take LLM agents from demo to production.
>
> **Sub:** Two years embedded with Australian state government agencies, running requirements and shipping the result. A decade of product and delivery behind it. This site is one of the systems — ask it something real.

Note the ANZ correction is baked in above. Check the OG/meta description separately — if it mirrors the old sub-line it will still say ANZ.

---

## S2 · Replace the "product manager" self-description

*Feedback item 2 — agreed, and already independently flagged as the weakest line on the page.*

**Remove**
> Consider me a product manager with a lot of hands-on experience.

**Replace with**
> Consider me the bridge between your stakeholders and your codebase — whether that means steering product, leading delivery, or architecting the solution.

**Why.** The original concedes the technical half in order to claim the product half, when the entire argument is that you hold both. It also self-selects into one title. Keep the lines immediately preceding it untouched — *"technical enough to build it, senior enough to run it, and to stand in front of a client"* is the strongest sentence on the site and this replacement should read as its conclusion, not compete with it.

---

## S3 · Agent suggested prompts — diversify

*Feedback item 3 — agreed.*

Current prompts skew entirely architectural (orchestration, retrieval design, human-in-the-loop). A visitor assessing you for delivery or account work has nothing to click.

**Keep three technical, add three interface-facing:**

- How does he handle changing client requirements?
- How does he work with executives who aren't technical?
- Tell me about a time he balanced technical debt against shipping.

All three are now well-served by the corpus — `wow-consensus`, `exp-rmit`, `wow-translation` and `exp-juvare-constraints`.

**Implementation note:** if prompts are hardcoded in the component, move them to a config object so they can change without a deploy. They're the highest-leverage copy on the page and will want tuning.

---

## S4 · Stack section — add a delivery column

*Feedback item 4 — agreed.*

Current categories are strictly technical. Add a fourth:

> **Product & delivery**
> Requirements elicitation · discovery workshops · user stories · roadmapping · Agile and hybrid delivery · stakeholder alignment · cross-functional coordination

**Why it matters more than it looks.** A visitor scanning a stack list is forming a category judgement about what kind of professional you are. An all-technical list answers that question before they read a word of prose. This is the cheapest single change in the spec.

Keep it visually equal to the other three columns — subordinating it visually undoes the point.

---

## S5 · business-mono — lead with the problem, not the architecture

*Feedback item 5 — agreed, and the most valuable content change here.*

The section currently opens on architecture (Simon, nine specialists, Postgres). Architecture proves you can build. It does not prove you can decide *what* to build, which is the thing an interface role hires for.

**Add before the existing architecture copy:**

> The problem: a two-person company with a real compliance obligation, and more operational surface than two people can hold. Client conversations, research, content, CRM, scheduling — all of it either done properly or done at all, never both.
>
> So the design question wasn't "what can agents do." It was which decisions could safely leave a human's hands, and which never could. That's why a single coordinator holds every human conversation, why approvals graduate from confirmed to autonomous only as reliability is proven, and why regulated advice hits a compliance reviewer that has no authority to approve anything.

Then the existing architecture detail follows as the answer.

**Also fix the heading** (P2-4 in the companion ticket): `business-mono` means nothing to a visitor. Lead with the description, keep the repo name as subtitle.

---

## S6 · Juvare — make the translation explicit

*Feedback item 6 — agreed. This is your strongest interface evidence and it currently reads as a build credit.*

**Current shape:** "Running requirements with them and tailoring WebEOC… Front-end build inside a legacy codebase."

**Rewrite:**

> Australian state government agencies — police through primary industries — running systems people depend on during live incidents. My job was to sit with them, understand how they actually operate, and turn that into working software.
>
> The friction was structural. Agencies needed the system to match processes they couldn't change, on a platform with real constraints — jQuery and legacy bundles underneath. Neither side could simply be told no. So the work was finding what the agency actually needed underneath what they asked for, and what the platform could honestly deliver, and landing something in the overlap. I ran that conversation and then I built the result.

**Why.** "Neither side could simply be told no" is the sentence that does the work. It describes the exact condition an interface hire is employed for, and you have two years of it in a high-stakes domain.

---

## S7 · Extend the listening principle to both sides

*Feedback item 7 — agreed.*

Currently framed around client elicitation only. Add:

> It cuts both ways. Clients rarely state the constraint that actually matters, and engineers rarely state the one they've already decided is obvious. Most of the failures I've seen came from one of those going unsaid, not from anyone being wrong.

**Why.** The existing copy positions you as good with clients. This positions you as bidirectional, which is the actual job — and it signals you've been on the engineering side of that conversation, not just the client side.

---

## S8 · Human-in-the-loop as product philosophy

*Feedback item 9 — agreed.*

Currently presented under control flow and safety as an architectural pattern. Add, wherever the concept is introduced:

> This isn't only an engineering pattern. Systems people don't trust don't get used, and an AI system that gets quietly worked around has failed no matter how good the retrieval is. Keeping a human at the edge of every consequential decision is how adoption survives contact with the people who have to live with it.

**Why.** Reframes a safety mechanism as a product judgement about adoption and change management. Directly relevant to TPM and Solutions Architect readers, and true.

---

## S9 · Call to action

*Feedback item 8 — partially agreed.*

The review suggested softening to "Building complex systems and need someone who can align the engineering team with the client's reality?" That drops AI entirely, which overcorrects.

**Proposed:**

> Building something with AI in it that has to actually work for the people using it — and need someone who can run that conversation and then build the result? Let's talk.

Retains the AI anchor, adds adoption and stakeholder framing, and mirrors the forward-deployed shape without using the jargon.

---

## S10 · BTS title — no change

*Feedback item 10 — rejected. Decision confirmed.*

**Hold: Co-founder & Principal Engineer.**

The review argued "Principal Engineer" signals heads-down and technical, and suggested Technical Product Lead or Head of Product/Tech.

**Why it's held.** The market risk for this profile runs the other way. With a decade of PM history and a headline about delivery, the standing danger is being read as a product person who used to code — which is why the site moved *off* "Director" in the first place. "Principal Engineer" is the counterweight, and at a company where you are the only engineer it is also the accurate description. LinkedIn and the CV both carry it; a third variant creates a discrepancy a diligent recruiter will notice.

**The broadening happens in the body copy instead** (S2, S5, S7), which is where it belongs — a title is a fact, not positioning.

---

## Sequencing

1. Apply the companion ticket's P0 corrections first — RMIT decade, ANZ, availability, BTS title, email. Factual errors outrank positioning.
2. Regenerate `embeddings.json`. Ten chunks are stale; until then the agent contradicts the site.
3. S2, S4, S3 — small, high-leverage, low-risk. Ship together.
4. S5, S6, S7, S8 — the substantive rewrites. Draft, read aloud, then ship.
5. S9 last, once the body copy is settled. S1 is now a one-line sub-heading swap and can ship any time.

---

## Open decisions

| # | Decision | Status |
|---|---|---|
| S1 | Hero H1 — Option A or B | Resolved — Option A, H1 held |
| S10 | BTS title | Resolved — hold Principal Engineer |
| S11 | Site role label | Resolved — "Technical Product Lead — AI" |
| — | Email: `hello@` vs `chris@` | Outstanding — see companion ticket P1-1 |
| — | Public featuring of the repo | Outstanding — Carolyn conversation |

---

## S11 · Site role label — resolved

**Use: Technical Product Lead — AI**

Replace every instance of "AI Delivery Lead" in the site chrome:

- `<title>` tag
- OG title and Twitter card title
- Header / nav role label
- Any structured data (`jsonLd` person schema, if present)
- Footer, if it carries a role line

**Why this one.** It matches LinkedIn and the CV exactly, so a recruiter moving between the three sees one person with one title. That consistency is worth more than the marginal fit "AI Delivery Lead" had for consulting work — and the consultancy campaign is served by the body copy, not the label.

**One caveat to revisit.** If the fractional and independent path becomes the main line rather than the fallback, "AI Delivery Lead" is the better client-facing label — it describes a service rather than a job. Worth re-examining after the first few consultancy conversations, when you have heard how they describe the role themselves.

**Check for near-misses.** The old label may appear as "AI delivery lead" in sentence case inside body copy, where it can legitimately stay if it reads as a description rather than a title. Search case-insensitively and judge each instance.

---

## What was deliberately not changed

- **The H1 in Option A**, and the line *"This site is one of the systems — ask it something real."* Best copy on the page.
- **"Technical enough to build it, senior enough to run it, and to stand in front of a client."** The review called this the perfect hook and it is. Untouched.
- **The nine-specialist detail and the architecture copy.** Reordered behind the problem statement in S5, not cut. Technical depth is what makes the interface claim credible rather than aspirational.
