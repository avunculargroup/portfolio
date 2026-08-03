"use client";

import type { TraceStep as TraceStepData } from "@/lib/trace";
import { TraceStep } from "./trace-step";
import styles from "./trace-panel.module.css";

interface TracePanelProps {
  steps: TraceStepData[];
  status: string;
  tokens: number;
  cost: string;
  live: boolean;
  /* Passed in from the server rather than imported: `lib/openrouter.ts`
     constructs the provider, and pulling that into a client component ships the
     provider SDK to the browser (CLAUDE.md — it must stay server-only). */
  modelLabel: string;
}

export function TracePanel({ steps, status, tokens, cost, live }: TracePanelProps) {
  if (steps.length === 0) return null;

  return (
    <div className={styles.trace} aria-label="How I got there">
      <p className={styles.title}>
        <span className={`${styles.dot} ${live ? styles.live : ""}`} aria-hidden="true" />
        How I got there
      </p>

      <div className={styles.body}>
        {steps.map((step, index) => (
          <TraceStep key={step.id} step={step} index={index} />
        ))}
      </div>

      {status === "done" && (
        <p className={styles.meta}>
          {steps.length} step{steps.length === 1 ? "" : "s"} · {tokens} tokens
          · {cost}
        </p>
      )}
    </div>
  );
}
