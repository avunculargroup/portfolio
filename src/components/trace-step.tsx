import type { TraceStep as TraceStepData } from "@/lib/trace";
import styles from "./trace-step.module.css";

const STATE_CLASS = {
  running: styles.running,
  done: styles.done,
  failed: styles.failed,
} as const;

export function TraceStep({ step }: { step: TraceStepData }) {
  return (
    <div className={`${styles.step} ${STATE_CLASS[step.state]}`}>
      <div className={styles.top}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.name}>{step.name}</span>
        <span className={styles.dur}>
          {step.state === "running"
            ? "…"
            : step.state === "failed"
              ? "error"
              : "done"}
        </span>
      </div>

      {(step.detail || step.hits || step.errorText) && (
        <div className={styles.meta}>
          {step.detail && <div>{step.detail}</div>}

          {step.hits?.map((hit) => (
            <div key={`${hit.index}-${hit.title}`} className={styles.hitRow}>
              <span className={styles.hitIndex}>#{hit.index}</span>
              <span className={styles.hitTitle}>
                {hit.title}
                <span className={styles.hitCat}> · {hit.category}</span>
              </span>
            </div>
          ))}

          {step.state === "done" && step.hits === undefined && (
            <div>no matching chunks</div>
          )}

          {step.errorText && (
            <div className={styles.errorText}>{step.errorText}</div>
          )}
        </div>
      )}
    </div>
  );
}
