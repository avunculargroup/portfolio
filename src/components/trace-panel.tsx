"use client";

import { useEffect, useRef } from "react";
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
  /** Hidden from the a11y tree when the mobile tab control has it deselected. */
  id?: string;
  labelledBy?: string;
  hidden?: boolean;
}

export function TracePanel({
  steps,
  status,
  tokens,
  cost,
  live,
  modelLabel,
  id,
  labelledBy,
  hidden,
}: TracePanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Keep the newest step in view as the loop runs.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || steps.length === 0) return;
    body.scrollTop = body.scrollHeight;
  }, [steps]);

  return (
    <aside
      className={styles.trace}
      id={id}
      role={labelledBy ? "tabpanel" : undefined}
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : "Agent trace"}
      hidden={hidden}
    >
      <div className={styles.head}>
        <span
          className={`${styles.dot} ${live ? styles.live : ""}`}
          aria-hidden="true"
        />
        <span className={styles.title}>agent trace</span>
        <span className={styles.status}>{status}</span>
      </div>

      <div className={styles.body} ref={bodyRef}>
        {steps.length === 0 ? (
          <p className={styles.empty}>
            <b>portfolio-agent</b> · {modelLabel}
            <br />
            tools: search_experience · get_project_detail · draft_pitch
            <br />
            <br />
            Ask a question to see the tool loop run —
            <br />
            route → embed → retrieve → cite → draft.
          </p>
        ) : (
          steps.map((step) => <TraceStep key={step.id} step={step} />)
        )}
      </div>

      <div className={styles.foot}>
        <span>
          steps <b>{steps.length}</b>
        </span>
        <span>
          tokens <b>{tokens}</b>
        </span>
        <span>
          cost <b>{cost}</b>
        </span>
      </div>
    </aside>
  );
}
