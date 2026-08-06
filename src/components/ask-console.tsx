"use client";

import { useId, useRef, useState } from "react";
import { MAX_INPUT_CHARS } from "@/lib/config";
import styles from "./ask-console.module.css";

/* Chosen against the current corpus — every one of these retrieves a chunk
   that answers it directly. Covered by the retrieval evals in scripts/eval.ts;
   re-check there before changing one. */
const EXAMPLES = [
  {
    label: "See his code?",
    query: "Can I see code he's actually written?",
  },
  { label: "Has he led a team?", query: "Has Chris led a team?" },
  { label: "With clients?", query: "What's he like with clients?" },
  {
    label: "Legacy code?",
    query: "How does he handle legacy code?",
  },
] as const;

interface AskConsoleProps {
  onAsk: (question: string) => void;
  onPitch: (role: string, company: string) => void;
  busy: boolean;
  disabled: boolean;
}

export function AskConsole({
  onAsk,
  onPitch,
  busy,
  disabled,
}: AskConsoleProps) {
  const [value, setValue] = useState("");
  const [showPitch, setShowPitch] = useState(false);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");

  const pitchFormId = useId();
  const roleId = useId();
  const companyId = useId();
  const roleRef = useRef<HTMLInputElement>(null);

  const blocked = busy || disabled;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const question = value.trim();
    if (!question || blocked) return;
    onAsk(question);
    setValue("");
  }

  function askExample(query: string) {
    if (blocked) return;
    setValue(query);
    onAsk(query);
    setValue("");
  }

  function togglePitch() {
    setShowPitch((open) => {
      if (!open) {
        // Focus lands on the first field once it exists.
        requestAnimationFrame(() => roleRef.current?.focus());
      }
      return !open;
    });
  }

  function submitPitch(event: React.FormEvent) {
    event.preventDefault();
    if (blocked) return;
    onPitch(role.trim() || "AI Engineer", company.trim());
  }

  return (
    <div>
      <form className={styles.form} onSubmit={submit}>
        <label className="srOnly" htmlFor="ask-input">
          Ask the portfolio agent a question
        </label>
        <input
          id="ask-input"
          className={styles.input}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. Can I see code he's actually written?"
          autoComplete="off"
          maxLength={MAX_INPUT_CHARS}
          disabled={disabled}
        />
        {/* Deliberately not disabled on empty input — a greyed-out primary
            action on first paint reads as "broken". Submit no-ops instead. */}
        <button type="submit" className={styles.send} disabled={blocked}>
          <span className={styles.sendLabel}>{busy ? "…" : "Ask"}</span>
          <span className={styles.sendIcon} aria-hidden="true">
            {busy ? "…" : "→"}
          </span>
          <span className="srOnly">Send question</span>
        </button>
      </form>

      <div className={styles.chips}>
        {EXAMPLES.map((example) => (
          <button
            key={example.label}
            type="button"
            className={styles.chip}
            onClick={() => askExample(example.query)}
            disabled={blocked}
          >
            {example.label}
          </button>
        ))}
        <button
          type="button"
          className={styles.pitchToggle}
          onClick={togglePitch}
          aria-expanded={showPitch}
          aria-controls={pitchFormId}
          disabled={disabled}
        >
          {showPitch ? "Hide pitch form ↑" : "Get a tailored pitch ↴"}
        </button>
      </div>

      {showPitch && (
        <form
          id={pitchFormId}
          className={styles.pitchForm}
          onSubmit={submitPitch}
        >
          <div className={styles.field}>
            <label className={styles.pitchLabel} htmlFor={roleId}>
              Role
            </label>
            <input
              ref={roleRef}
              id={roleId}
              className={styles.pitchInput}
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Senior AI Engineer"
              maxLength={120}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.pitchLabel} htmlFor={companyId}>
              Company
            </label>
            <input
              id={companyId}
              className={styles.pitchInput}
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="(optional)"
              maxLength={120}
              autoComplete="off"
            />
          </div>

          <button type="submit" className={styles.pitchGo} disabled={blocked}>
            Generate pitch
          </button>
        </form>
      )}
    </div>
  );
}
