"use client";

import { useId, useRef, useState } from "react";
import { MAX_INPUT_CHARS } from "@/lib/config";
import styles from "./ask-console.module.css";

const EXAMPLES = [
  { label: "Production RAG?", query: "Has Chris shipped production RAG?" },
  {
    label: "How does it stay safe?",
    query: "How does his agent system stay safe?",
  },
  { label: "Where has he worked?", query: "Where has Chris worked?" },
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
          placeholder="e.g. Has Chris shipped production RAG?"
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
