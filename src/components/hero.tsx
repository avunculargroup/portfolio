"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { PortfolioUIMessage } from "@/lib/agent";
import {
  collectTrace,
  estimateCost,
  estimateTokens,
  type TraceStep,
} from "@/lib/trace";
import { AskConsole } from "./ask-console";
import { Dossier } from "./dossier";
import { TracePanel } from "./trace-panel";
import styles from "./hero.module.css";

type Pane = "answer" | "trace";

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

export function Hero({ agentAvailable }: { agentAvailable: boolean }) {
  const [pane, setPane] = useState<Pane>("answer");
  const [question, setQuestion] = useState<string | null>(null);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  const answerTabId = useId();
  const traceTabId = useId();
  const answerPaneId = useId();
  const tracePaneId = useId();
  const tabsRef = useRef<HTMLDivElement>(null);

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

  const steps: TraceStep[] = useMemo(
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

  // While the agent streams, the Trace tab advertises itself with a pulsing
  // dot — but the answer stays selected. The visitor chooses to look.
  const traceIsLive = streaming && steps.length > 0;

  // Roving tab focus (left/right/home/end) for the segmented control.
  function onTabKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const next: Pane =
      event.key === "Home"
        ? "answer"
        : event.key === "End"
          ? "trace"
          : pane === "answer"
            ? "trace"
            : "answer";

    setPane(next);
    const id = next === "answer" ? answerTabId : traceTabId;
    tabsRef.current?.querySelector<HTMLButtonElement>(`#${CSS.escape(id)}`)?.focus();
  }

  // A stream error carries the guardrail's own copy — show it as a notice.
  useEffect(() => {
    if (error) setOfflineNotice(error.message);
  }, [error]);

  const notice = offlineNotice;

  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.grid}`}>
        <div>
          <p className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden="true" />
            Ask the agent about my work
          </p>

          <h1 className={styles.thesis}>
            I lead AI delivery — and <em>build the systems</em> myself.
          </h1>

          <p className={styles.sub}>
            A decade turning roadmaps into shipped software, now pointed at
            agentic AI. Ask the agent below about my work — it&rsquo;s one I
            built.
          </p>

          <AskConsole
            onAsk={ask}
            onPitch={pitch}
            busy={streaming}
            disabled={false}
          />

          {/* Answer-first: the segmented control sits above the answer area and
              defaults to Answer, so the trace can never bury the answer. */}
          <div
            className={styles.tabs}
            role="tablist"
            aria-label="Answer or agent trace"
            ref={tabsRef}
            onKeyDown={onTabKeyDown}
          >
            <button
              type="button"
              id={answerTabId}
              className={styles.tab}
              role="tab"
              aria-selected={pane === "answer"}
              aria-controls={answerPaneId}
              tabIndex={pane === "answer" ? 0 : -1}
              onClick={() => setPane("answer")}
            >
              Answer
            </button>
            <button
              type="button"
              id={traceTabId}
              className={styles.tab}
              role="tab"
              aria-selected={pane === "trace"}
              aria-controls={tracePaneId}
              tabIndex={pane === "trace" ? 0 : -1}
              onClick={() => setPane("trace")}
            >
              Trace
              {traceIsLive && (
                <>
                  <span className={styles.tabDot} aria-hidden="true" />
                  <span className="srOnly">(live)</span>
                </>
              )}
            </button>
          </div>

          <Dossier
            id={answerPaneId}
            labelledBy={answerTabId}
            hidden={pane !== "answer"}
            question={question}
            message={assistantMessage}
            streaming={streaming}
            notice={notice}
          />
        </div>

        {/* Second grid cell. Below lg this is the "Trace" tab panel; at lg and
            above it is the right-hand column and is always visible. */}
        <div className={styles.tracePane}>
          <TracePanelResponsive
            id={tracePaneId}
            labelledBy={traceTabId}
            hiddenOnMobile={pane !== "trace"}
            steps={steps}
            status={traceStatus}
            tokens={tokens}
            cost={estimateCost(tokens)}
            live={streaming}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * The panel is a tab panel below lg and a plain column at lg+. `hidden` can't
 * be driven by a media query, so the breakpoint is observed here and the two
 * roles are kept distinct for assistive tech.
 */
function TracePanelResponsive({
  id,
  labelledBy,
  hiddenOnMobile,
  ...panelProps
}: {
  id: string;
  labelledBy: string;
  hiddenOnMobile: boolean;
  steps: TraceStep[];
  status: string;
  tokens: number;
  cost: string;
  live: boolean;
}) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <TracePanel
      {...panelProps}
      id={id}
      labelledBy={isDesktop ? undefined : labelledBy}
      hidden={isDesktop ? false : hiddenOnMobile}
    />
  );
}
