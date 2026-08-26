import { FactSlot } from "./fact-slot";
import styles from "./failure-story.module.css";

/* ---------------------------------------------------------------------------
   PLACEHOLDER CONTENT — every string below is fabricated and marked `{{FAKE: }}`.

   This block is the evidence for the second principle in "Two things I've
   believed for a decade" ("I own the decisions — including the wrong ones"),
   so it sits directly beneath it and is sized to match: four short beats, no
   architecture diagram, no metrics grid. It is not a case study.

   The heading states the failure. It is not softened to "a lesson learned" or
   "what I'd do differently" — that framing is what makes these blocks worthless.
   --------------------------------------------------------------------------- */

const BEATS = [
  {
    slot: "The call — what you decided, stated flatly",
    label: "The call",
    body: "{{FAKE: I chose to build Acme's integration layer against their beta API instead of the stable one, because the beta removed about three weeks of work.}}",
  },
  {
    slot: "Why it was wrong — the thing you should have weighted and didn't",
    label: "Why it was wrong",
    body: "{{FAKE: I weighed it as a technical bet and it was a dependency bet. I had no commitment from Acme about the beta's timeline, and I never asked for one, because I did not want to hear the answer.}}",
  },
  {
    slot: "What it cost — in time, money, or someone else's work",
    label: "What it cost",
    body: "{{FAKE: They deprecated it 7 weeks before launch. Two engineers spent a month rewriting the layer, we missed the date by 6 weeks, and one of them lost a booked holiday to it.}}",
  },
  {
    slot: "What you did about it — the change, not the feeling",
    label: "What I did about it",
    body: "{{FAKE: I told the client it was my call and my error, in the room, before anyone asked. Then I wrote down the rule I had broken — no unversioned dependency on the critical path without a written commitment — and I have not broken it since.}}",
  },
] as const;

export function FailureStory() {
  return (
    <section
      className={styles.section}
      id="failure"
      aria-labelledby="failure-title"
    >
      <div className="wrap">
        <div className={styles.inner}>
          <p className="secEyebrow">The evidence for the second one</p>
          <h2 id="failure-title" className={styles.title}>
            {"{{FAKE: I made a call that cost the project 6 weeks and a colleague their holiday}}"}
          </h2>

          <ol className={styles.beats}>
            {BEATS.map((beat) => (
              <li key={beat.label} className={styles.beat}>
                <FactSlot label={beat.slot}>
                  <p className={styles.beatLabel}>{beat.label}</p>
                  <p className={styles.beatBody}>{beat.body}</p>
                </FactSlot>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
