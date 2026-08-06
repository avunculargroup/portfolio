import { CORPUS_SIZE } from "@/lib/corpus";
import { CHAT_MODEL, EMBEDDING_MODEL } from "@/lib/openrouter";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <p className={styles.note}>
          <b>A quick note on how this works.</b> The Q&amp;A above is a real
          multi-agent loop, not a script — a Vercel AI SDK{" "}
          <b>ToolLoopAgent</b> on <b>{CHAT_MODEL}</b> that reads only from a
          small, curated corpus ({CORPUS_SIZE} chunks, retrieved by cosine similarity
          over {EMBEDDING_MODEL} embeddings), cites what it finds, and tells
          you plainly when something isn&rsquo;t covered rather than guessing.
          Nothing you type is stored: no accounts, no database, no memory
          between visits. Experience and education come from my CV; project
          facts from the public business-mono repo.
        </p>
        <p className={styles.colophon}>
          © {new Date().getFullYear()} Chris Pollard · Built as a live
          demonstration of agent engineering.
        </p>
      </div>
    </footer>
  );
}
