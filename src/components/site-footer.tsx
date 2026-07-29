import { CHAT_MODEL, EMBEDDING_MODEL } from "@/lib/openrouter";
import styles from "./site-footer.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <p className={styles.note}>
          <b>How this works.</b> The agent is real: a Vercel AI SDK{" "}
          <b>ToolLoopAgent</b> on <b>{CHAT_MODEL}</b>, answering only from a
          curated corpus of {26} chunks retrieved by cosine similarity over{" "}
          {EMBEDDING_MODEL} embeddings. Every claim it makes is grounded in a
          retrieved chunk and cited; if the corpus doesn&rsquo;t cover
          something, it says so rather than guessing. The trace panel is driven
          by the real tool loop, not a script. Stateless and anonymous — no
          database, no accounts, no cross-session memory. Experience and
          education come from Chris&rsquo;s CV; project facts from the public
          business-mono repo.
        </p>
        <p className={styles.colophon}>
          © {new Date().getFullYear()} Chris Pollard · Built as a live
          demonstration of agent engineering.
        </p>
      </div>
    </footer>
  );
}
