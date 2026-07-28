"use client";

import { useId } from "react";
import type { UIMessage } from "ai";
import { renderWithCitations } from "./citation-chip";
import { collectSources } from "@/lib/trace";
import type { CitedChunk, Pitch } from "@/lib/tools";
import styles from "./dossier.module.css";

interface DossierProps {
  question: string | null;
  message: UIMessage | null;
  streaming: boolean;
  /** Calm, non-error notice shown when the agent is unavailable or limited. */
  notice: string | null;
  id?: string;
  labelledBy?: string;
  hidden?: boolean;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

/** Pull a structured pitch out of a draft_pitch tool result, if there is one. */
function findPitch(message: UIMessage | null): Pitch | null {
  if (!message) return null;

  for (const part of message.parts) {
    if (part.type !== "tool-draftPitch") continue;
    const candidate = part as { state?: string; output?: unknown };
    if (candidate.state !== "output-available") continue;

    const pitch = asRecord(asRecord(candidate.output)?.pitch);
    if (pitch && typeof pitch.headline === "string") {
      return pitch as unknown as Pitch;
    }
  }

  return null;
}

function PitchView({ pitch }: { pitch: Pitch }) {
  return (
    <div className={styles.pitch}>
      <p className={styles.pitchHeadline}>{pitch.headline}</p>

      <div className={styles.pitchGroup}>
        <p className={styles.pitchLabel}>Why he fits</p>
        <ul className={styles.pitchList}>
          {pitch.why_fit.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>

      <div className={styles.pitchGroup}>
        <p className={styles.pitchLabel}>Relevant work</p>
        <ul className={styles.pitchList}>
          {pitch.relevant_work.map((work) => (
            <li key={work}>{work}</li>
          ))}
        </ul>
      </div>

      {pitch.caveats && pitch.caveats.length > 0 && (
        <div className={styles.pitchGroup}>
          <p className={styles.pitchLabel}>Caveats</p>
          <ul className={`${styles.pitchList} ${styles.caveats}`}>
            {pitch.caveats.map((caveat) => (
              <li key={caveat}>{caveat}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SourceList({
  sources,
  listId,
}: {
  sources: CitedChunk[];
  listId: string;
}) {
  return (
    <div className={styles.sources}>
      <h3 className={styles.sourcesTitle}>Sources</h3>
      <ol className={styles.sourceList}>
        {sources.map((source, index) => (
          <li
            key={source.id}
            id={`${listId}-${index + 1}`}
            className={styles.source}
          >
            <span className={styles.sourceIndex}>[{index + 1}]</span>
            <span className={styles.sourceTitle}>{source.title}</span> —{" "}
            {source.text}{" "}
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.url.replace(/^https?:\/\//, "")}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Dossier({
  question,
  message,
  streaming,
  notice,
  id,
  labelledBy,
  hidden,
}: DossierProps) {
  const listId = useId();

  const text = message
    ? message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("")
    : "";

  const sources = message ? collectSources(message) : [];
  const pitch = findPitch(message);
  const hasToolActivity = Boolean(
    message?.parts.some((part) => part.type.startsWith("tool-")),
  );

  return (
    <div
      className={styles.answer}
      id={id}
      role={labelledBy ? "tabpanel" : undefined}
      aria-labelledby={labelledBy}
      hidden={hidden}
    >
      {/* Announce the settled answer, not every streamed token (spec §8). */}
      <div aria-live="polite" aria-atomic="false">
        {question && (
          <p className={styles.question}>
            <span className={`${styles.qKey} mono`} aria-hidden="true">
              Q
            </span>
            <span>{question}</span>
          </p>
        )}

        {notice ? (
          <p className={styles.notice}>{notice}</p>
        ) : (
          <>
            {pitch && <PitchView pitch={pitch} />}

            {(text || streaming) && (
              <p className={styles.body}>
                {text ? (
                  renderWithCitations(text, sources, listId)
                ) : hasToolActivity ? (
                  <span className={styles.thinking}>retrieving…</span>
                ) : (
                  <span className={styles.thinking}>thinking…</span>
                )}
                {streaming && text && (
                  <span className={styles.caret} aria-hidden="true" />
                )}
              </p>
            )}

            {!streaming && sources.length > 0 && (
              <SourceList sources={sources} listId={listId} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
