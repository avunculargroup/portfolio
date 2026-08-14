"use client";

import styles from "./signposts.module.css";

/*
 * A map for the visitor who won't type a question. Each row names something a
 * hiring manager might be assessing, says where the evidence lives, and asks
 * the agent for it — so the rows double as suggested prompts.
 *
 * Every `query` is covered by a retrieval eval in scripts/eval.ts; re-check
 * there before changing one (same rule as AskConsole's examples).
 */
const SIGNPOSTS = [
  {
    topic: "Agent orchestration and routing",
    where: "One coordinator, nine specialists, one audit trail.",
    query: "How does the coordinator route work to the specialist agents?",
    link: {
      href: "https://github.com/avunculargroup/business-mono",
      label: "Architecture overview in the repo",
    },
  },
  {
    topic: "Retrieval design",
    where: "Vector, graph and full-text search sitting side by side.",
    query: "How does retrieval work in business-mono?",
    link: {
      href: "https://github.com/avunculargroup/business-mono",
      label: "packages/db/src/rpc/",
    },
  },
  {
    topic: "Human-in-the-loop control flow",
    where:
      "The business analyst agent runs multi-round elicitation, pausing mid-workflow with suspend/resume.",
    query: "How does the system pause mid-workflow to ask a human?",
  },
  {
    topic: "Safety and governance",
    where:
      "Approval graduation, and Lex — the compliance agent that reviews advice against AFSL rules and never auto-approves.",
    query: "How does the system stay safe and compliant?",
  },
  {
    topic: "Code written in a team",
    where: "Two years of commits in a shared open-source codebase.",
    query: "What did Chris build at Beyond Essential Systems?",
    link: {
      href: "https://github.com/beyondessential/tupaia/commits?author=chris-pollard",
      label: "Tupaia commits, filterable by author",
    },
  },
] as const;

export function Signposts({
  onAsk,
  disabled,
}: {
  onAsk: (question: string) => void;
  /** Mirrors the console: no live agent, no ask buttons — links still work. */
  disabled: boolean;
}) {
  return (
    <div className={styles.wrap}>
      <p className={styles.heading}>Not sure what to ask?</p>
      <ul className={styles.list}>
        {SIGNPOSTS.map((signpost) => (
          <li key={signpost.topic} className={styles.row}>
            <p className={styles.topic}>{signpost.topic}</p>
            <div className={styles.detail}>
              <p className={styles.where}>{signpost.where}</p>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.ask}
                  onClick={() => onAsk(signpost.query)}
                  disabled={disabled}
                >
                  Ask the agent
                </button>
                {"link" in signpost && signpost.link ? (
                  <a
                    className={styles.link}
                    href={signpost.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {signpost.link.label} ↗
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
