"use client";

import { useCallback, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { PortfolioUIMessage } from "@/lib/agent";
import { collectTrace, estimateCost, estimateTokens } from "@/lib/trace";
import { AskConsole } from "./ask-console";
import { Dossier } from "./dossier";
import { Signposts } from "./signposts";
import { TracePanel } from "./trace-panel";
import styles from "./ask-section.module.css";

/**
 * Guardrail responses come back as JSON `{ type: "notice", message }` with a
 * non-2xx status. Surface that copy verbatim instead of a raw stream error, so
 * the console can show a calm notice (spec §5).
 */
const noticeAwareFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (response.ok) return response;

  let message =
    "The agent isn't reachable right now. Everything else on this page still works.";
  try {
    const body = (await response.clone().json()) as { message?: string };
    if (typeof body.message === "string" && body.message) message = body.message;
  } catch {
    // Non-JSON error body — keep the generic copy.
  }

  throw new Error(message);
};

export function AskSection({
  agentAvailable,
  chatModelLabel,
}: {
  agentAvailable: boolean;
  /* Server-provided: see TracePanel's `modelLabel`. */
  chatModelLabel: string;
}) {
  const [question, setQuestion] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<PortfolioUIMessage>({
        api: "/api/chat",
        fetch: noticeAwareFetch,
      }),
    [],
  );

  const { messages, sendMessage, status, error, clearError } =
    useChat<PortfolioUIMessage>({
      transport,
      // Throttle re-renders so a fast stream doesn't thrash the DOM.
      experimental_throttle: 50,
    });

  const streaming = status === "submitted" || status === "streaming";

  const assistantMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message?.role === "assistant") return message;
    }
    return null;
  }, [messages]);

  const steps = useMemo(
    () => (assistantMessage ? collectTrace(assistantMessage) : []),
    [assistantMessage],
  );

  const tokens = useMemo(
    () => (assistantMessage ? estimateTokens(assistantMessage) : 0),
    [assistantMessage],
  );

  const traceStatus = streaming
    ? steps.length > 0
      ? "running"
      : "starting"
    : assistantMessage
      ? "done"
      : "idle";

  const ask = useCallback(
    (text: string) => {
      if (!agentAvailable) {
        setQuestion(text);
        setOfflineNotice(
          "The live agent is offline in this deployment — no API key is configured. Everything below is the same ground it would cover, and it's all real.",
        );
        return;
      }
      clearError();
      setOfflineNotice(null);
      setQuestion(text);
      void sendMessage({ text });
    },
    [agentAvailable, clearError, sendMessage],
  );

  const pitch = useCallback(
    (role: string, company: string) => {
      const label = company ? `${role} at ${company}` : role;
      ask(`Pitch Chris for this role: ${label}`);
    },
    [ask],
  );

  const notice = error ? error.message : offlineNotice;
  const hasAsked = question !== null;

  return (
    <section id="ask" className={`blk ${styles.section}`}>
      <div className="wrap">
        <p className="secEyebrow">Try it</p>
        <h2 className="sectionTitle">Ask me anything — really.</h2>
        <p className="lead">
          This isn&rsquo;t a chatbot glued on top. It&rsquo;s the same kind of
          multi-agent system I design and put in front of clients — answering
          from what I&rsquo;ve actually written about my work, grounded,
          cited, and honest when it doesn&rsquo;t know.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <AskConsole onAsk={ask} onPitch={pitch} busy={streaming} disabled={false} />
          </div>

          <div className={styles.card}>
            {hasAsked ? (
              <>
                <Dossier
                  question={question}
                  message={assistantMessage}
                  streaming={streaming}
                  notice={notice}
                />
                {!notice && (
                  <TracePanel
                    steps={steps}
                    status={traceStatus}
                    tokens={tokens}
                    cost={estimateCost(tokens)}
                    live={streaming}
                    modelLabel={chatModelLabel}
                  />
                )}
              </>
            ) : (
              <p className={styles.placeholder}>
                Ask a question on the left, or try one of the examples above —
                I&rsquo;ll answer for real, using what I&rsquo;ve actually
                written about my work.
              </p>
            )}
            <p className={styles.footnote}>
              Grounded in my actual notes — if something isn&rsquo;t covered,
              I&rsquo;d rather say so than guess.
            </p>
          </div>
        </div>

        {/* Inside the section rather than a sibling of it: the rows pre-fill
            the console above, so they need the same `ask` callback. */}
        <Signposts onAsk={ask} disabled={!agentAvailable || streaming} />
      </div>
    </section>
  );
}
