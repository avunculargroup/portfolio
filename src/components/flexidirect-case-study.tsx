import { FactSlot } from "./fact-slot";
import styles from "./flexidirect-case-study.module.css";

/* ---------------------------------------------------------------------------
   PLACEHOLDER CONTENT — every string below is fabricated and marked `{{FAKE: }}`.
   It exists to render the *shape* of the FlexiDirect argument: situation →
   decision → commercial call → what shipped → outcome → hindsight. The two
   slots that carry the weight (the decision and the outcome) are laid out as
   full-width feature blocks; the rest are quieter cards.

   Nothing here has been added to data/corpus.json — the agent cannot see any
   of it, and must not.
   --------------------------------------------------------------------------- */

/** Who the product was actually for. Round, obviously-invented segments. */
const USERS = [
  "{{FAKE: 40,000 school leavers}}",
  "{{FAKE: 12 admissions officers at Acme Polytechnic}}",
  "{{FAKE: 900 career advisers}}",
  "{{FAKE: 3 people in the VTAC call centre}}",
] as const;

/** The trade the decision bought. Two halves, deliberately opposed. */
const DECISION_HALVES = [
  {
    label: "What got cut",
    body: "{{FAKE: The entire course-comparison module, the saved-shortlist feature, and every one of Bartholomew Quibble's 22 requested report types.}}",
  },
  {
    label: "What that protected",
    body: "{{FAKE: One thing: an applicant on a phone, at 11pm on the closing date, being able to finish an application in under 10 minutes without ringing anyone.}}",
  },
] as const;

const SHIPPED = [
  "{{FAKE: Application intake, in 6 screens, down from 31}}",
  "{{FAKE: An offer-round dashboard for the 12 admissions officers}}",
  "{{FAKE: A single integration into the Acme Student Records mainframe}}",
  "{{FAKE: Nothing else. On purpose.}}",
] as const;

/** First admissions cycle after launch. Round numbers, obviously placeholder. */
const OUTCOME_METRICS = [
  { figure: "{{FAKE: 100%}}", caption: "{{FAKE: of the 40,000 applicants went through the new intake}}" },
  { figure: "{{FAKE: 10 min}}", caption: "{{FAKE: median time to complete, down from 90}}" },
  { figure: "{{FAKE: 0}}", caption: "{{FAKE: call-centre escalations on closing night, down from 500}}" },
] as const;

export function FlexiDirectCaseStudy() {
  return (
    <section
      className="blk"
      id="flexidirect"
      aria-labelledby="flexidirect-title"
    >
      <div className="wrap">
        <p className="secEyebrow">The decision on show</p>
        <h2 id="flexidirect-title" className="sectionTitle">
          {"{{FAKE: FlexiDirect — direct applications for Acme Tertiary Admissions}}"}
        </h2>
        <p className={styles.subtitle}>
          {"{{FAKE: VTAC · 2018–2020 · product owner}}"}
        </p>

        {/* 1 — Situation and users ------------------------------------------ */}
        <div className={styles.situation}>
          <FactSlot
            label="Situation — the state of things when this landed on you"
            className={styles.situationProse}
          >
            <p className="lead">
              {"{{FAKE: Acme Tertiary Admissions ran a single annual application window on a mainframe form written in 1997. It worked, in the sense that a determined 17-year-old with a desktop computer and 90 minutes could complete it.}}"}
            </p>
            <p className="lead">
              {"{{FAKE: The board wanted a second, year-round direct channel. Eleven institutions wanted eleven different versions of it. Nobody had asked the applicants anything.}}"}
            </p>
          </FactSlot>

          <FactSlot
            label="Users — who they actually were, not who the brief said"
            className={styles.situationUsers}
          >
            <p className={styles.usersHead}>
              {"{{FAKE: The people who actually had to use it}}"}
            </p>
            <ul className={styles.userList}>
              {USERS.map((user) => (
                <li key={user} className={styles.userItem}>
                  {user}
                </li>
              ))}
            </ul>
            <p className={styles.usersNote}>
              {"{{FAKE: The eleven institutions were stakeholders. They were not users. Holding that line is most of this story.}}"}
            </p>
          </FactSlot>
        </div>

        {/* 2 — The decision. Carries the most weight on the page. ------------ */}
        <FactSlot
          label="The decision — the call you made, in one sentence, then the trade"
          className={styles.feature}
        >
          <p className={styles.featureKicker}>The decision</p>
          <p className={styles.featureClaim}>
            {"{{FAKE: I cut the scope by two thirds and shipped an application form, not a course-discovery platform.}}"}
          </p>
          <p className={styles.featureBody}>
            {"{{FAKE: Discovery had turned up a single number that settled it: 70% of applicants had already chosen their course before they ever reached us. Every feature that assumed a browsing, comparing, undecided user was serving a user who was not there.}}"}
          </p>
          <div className={styles.trade}>
            {DECISION_HALVES.map((half) => (
              <div key={half.label} className={styles.tradeHalf}>
                <p className={styles.tradeLabel}>{half.label}</p>
                <p className={styles.tradeBody}>{half.body}</p>
              </div>
            ))}
          </div>
        </FactSlot>

        {/* 3 & 4 — Commercial call and what shipped, as the quieter pair. ---- */}
        <div className={styles.pair}>
          <FactSlot
            label="Commercial call — the pricing model, and the one you rejected"
            className={styles.card}
          >
            <p className={styles.cardKicker}>The commercial call</p>
            <h3 className={styles.cardTitle}>
              {"{{FAKE: Institutions pay per offer made, not per application received}}"}
            </h3>
            <p className={styles.cardBody}>
              {"{{FAKE: The obvious model was $10 per application. I argued against it: it charges an institution most for the applicants it rejects, which is exactly the wrong incentive, and it makes our revenue a tax on applicant volume we were trying to make cheaper.}}"}
            </p>
            <p className={styles.cardBody}>
              {"{{FAKE: Per-offer meant $1,000,000 of forecast revenue became $600,000 in year one and $1,400,000 by year three. I took that to the board with both curves drawn and let them choose. They chose per-offer.}}"}
            </p>
          </FactSlot>

          <FactSlot
            label="What shipped — scope, dates, team size"
            className={styles.card}
          >
            <p className={styles.cardKicker}>What shipped</p>
            <h3 className={styles.cardTitle}>
              {"{{FAKE: 6 screens, 9 months, a team of 5}}"}
            </h3>
            <ul className={styles.shippedList}>
              {SHIPPED.map((item) => (
                <li key={item} className={styles.shippedItem}>
                  {item}
                </li>
              ))}
            </ul>
          </FactSlot>
        </div>

        {/* 5 — Outcome. The second weight-bearing block. --------------------- */}
        <FactSlot
          label="Outcome — the first admissions cycle after launch, in numbers you can defend"
          className={styles.feature}
        >
          <p className={styles.featureKicker}>
            The first admissions cycle after launch
          </p>
          <div className={styles.metrics}>
            {OUTCOME_METRICS.map((metric) => (
              <div key={metric.caption} className={styles.metric}>
                <p className={styles.metricFigure}>{metric.figure}</p>
                <p className={styles.metricCaption}>{metric.caption}</p>
              </div>
            ))}
          </div>
          <p className={styles.featureBody}>
            {"{{FAKE: The part I did not predict: two of the eleven institutions asked to move their main application channel across the following year. The cut features were never requested again by anyone except Bartholomew Quibble.}}"}
          </p>
        </FactSlot>

        {/* 6 — Hindsight. Quiet coda, same role as the business-mono one. ---- */}
        <FactSlot
          label="What you'd do differently — a real one, not a humble-brag"
          className={styles.coda}
        >
          <p className={styles.codaKicker}>What I&rsquo;d do differently</p>
          <p className={styles.codaBody}>
            {"{{FAKE: I ran the discovery that produced the 70% number in month four, after the scope was already agreed. That meant the cut arrived as a reversal rather than a finding, and it cost me most of a quarter re-litigating it with people who had every right to be annoyed. The number was right and the sequence was wrong.}}"}
          </p>
        </FactSlot>
      </div>
    </section>
  );
}
