import { FactSlot } from "./fact-slot";
import styles from "./principles.module.css";

/*
 * Grounded in the `wow-listening` and `wow-ownership` corpus chunks — the same
 * two principles the agent will cite, said here in Chris's own voice
 * (CLAUDE.md → voice & copy: static copy is first person).
 */
const PRINCIPLES = [
  {
    title: "I listen more than I talk.",
    /* The second paragraph is the one that matters for an interface role: it
       says this runs toward the engineers as well as the client, which is
       the actual job (spec-broadening S7). */
    body: [
      "I pay as much attention to what people aren't saying as to what they are. Most people already know the right decision — what they need is a room safe enough to say it out loud. It's why elicitation and human-in-the-loop keep turning up in the systems I build: the same instinct, written down as architecture.",
      "It cuts both ways. Clients rarely state the constraint that actually matters, and engineers rarely state the one they've already decided is obvious. Most of the failures I've seen came from one of those going unsaid, not from anyone being wrong.",
    ],
  },
  {
    title: "I own the decisions — including the wrong ones.",
    body: "Making the call isn't the hard part. Standing behind it in public when it turns out badly is, and it's worth doing: it's how a team learns, and it sets the norm that being honest costs you nothing here. Easy to say. Genuinely hard to do.",
  },
] as const;

export function Principles() {
  return (
    <section className="blk" id="principles" aria-labelledby="principles-title">
      <div className="wrap">
        <p className="secEyebrow">How I work</p>
        <h2 id="principles-title" className="sectionTitle">
          Two things I&rsquo;ve believed for a decade
        </h2>
        <p className="lead">
          The tech I use has changed several times over. These haven&rsquo;t.
        </p>

        <div className={styles.grid}>
          {PRINCIPLES.map((principle) => (
            <article key={principle.title} className={styles.item}>
              <h3 className={styles.title}>{principle.title}</h3>
              {(typeof principle.body === "string"
                ? [principle.body]
                : principle.body
              ).map((para) => (
                <p key={para} className={styles.body}>
                  {para}
                </p>
              ))}
            </article>
          ))}
        </div>

        <CraftNote />
      </div>
    </section>
  );
}

/*
 * PLACEHOLDER CONTENT — fabricated, marked `{{FAKE: }}`.
 *
 * The visual-craft slot: performing arts, and six years running a video
 * production business. Framed as design taste plus commercial ownership, not
 * as biography — a small aside inside "How I work", deliberately not a
 * timeline entry, because on the timeline it reads as a gap to explain rather
 * than a capability.
 */
function CraftNote() {
  return (
    <FactSlot
      label="Visual craft — the arts background and the video business, as taste + ownership"
      className={styles.craft}
    >
      <p className={styles.craftKicker}>{"{{FAKE: Where the eye came from}}"}</p>
      <div className={styles.craftBody}>
        <p className={styles.craftLead}>
          {"{{FAKE: Twelve years on stage, then six years running Acme Motion Pictures — my own video production business, 200 films for 60 clients, every invoice and every edit my own.}}"}
        </p>
        <p className={styles.craftDetail}>
          {"{{FAKE: The arts half is why I can tell you what is wrong with a layout in specifics rather than in vibes, and why I care whether an interface has a rhythm. The business half is the part people skip: I quoted the work, I carried the risk when a shoot ran over, and I learned what a client will actually pay for — which turns out to be almost never the thing they asked for.}}"}
        </p>
      </div>
    </FactSlot>
  );
}
