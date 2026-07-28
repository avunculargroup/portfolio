import type { CitedChunk } from "@/lib/tools";
import styles from "./citation-chip.module.css";

/**
 * Splits streamed answer text on [n] markers and renders each one as a chip
 * linked to the matching entry in the source list. Anything the model cites
 * beyond the number of retrieved sources renders inert rather than pointing at
 * a source that doesn't exist.
 */
export function renderWithCitations(
  text: string,
  sources: CitedChunk[],
  sourceListId: string,
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /\[(\d{1,2})\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const n = Number(match[1]);
    const source = sources[n - 1];

    if (source) {
      nodes.push(
        <a
          key={`c-${key++}`}
          className={styles.chip}
          href={`#${sourceListId}-${n}`}
          title={source.title}
          aria-label={`Source ${n}: ${source.title}`}
        >
          [{n}]
        </a>,
      );
    } else {
      nodes.push(
        <span key={`c-${key++}`} className={`${styles.chip} ${styles.inert}`}>
          [{n}]
        </span>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
