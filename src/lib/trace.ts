/**
 * Derives the trace panel's contents from the agent's typed message parts.
 *
 * The panel is driven entirely by these parts — it is not decorative and does
 * not invent steps (spec §4). If a step shows in the panel, the agent really
 * took it.
 */
import type { UIMessage } from "ai";
import { COST_PER_TOKEN_USD } from "@/lib/config";
import type { CitedChunk } from "@/lib/tools";

export type TraceStepState = "running" | "done" | "failed";

export interface TraceHit {
  index: number;
  title: string;
  category: string;
  /** The artefact the chunk cites — rendered as a live link in the trace. */
  url?: string;
}

export interface TraceStep {
  id: string;
  /** snake_case tool name, as the agent sees it. */
  name: string;
  state: TraceStepState;
  detail?: string;
  hits?: TraceHit[];
  errorText?: string;
}

/** UI part type -> the tool name shown in the trace. */
const TOOL_LABELS: Record<string, string> = {
  "tool-searchExperience": "search_experience",
  "tool-getProjectDetail": "get_project_detail",
  "tool-draftPitch": "draft_pitch",
};

interface ToolPartLike {
  type: string;
  toolCallId?: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
}

function isToolPart(part: { type: string }): part is ToolPartLike {
  return part.type in TOOL_LABELS;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function describeInput(partType: string, input: unknown): string | undefined {
  const record = asRecord(input);
  if (!record) return undefined;

  if (partType === "tool-searchExperience") {
    return typeof record.query === "string" ? `"${record.query}"` : undefined;
  }
  if (partType === "tool-getProjectDetail") {
    return typeof record.project === "string" ? record.project : undefined;
  }
  if (partType === "tool-draftPitch") {
    const role = typeof record.role === "string" ? record.role : "role";
    const company =
      typeof record.company === "string" && record.company
        ? ` @ ${record.company}`
        : "";
    return `${role}${company}`;
  }
  return undefined;
}

function extractHits(output: unknown): CitedChunk[] {
  const record = asRecord(output);
  if (!record) return [];

  const raw = Array.isArray(record.hits)
    ? record.hits
    : Array.isArray(record.sources)
      ? record.sources
      : [];

  return raw.filter((hit): hit is CitedChunk => {
    const candidate = asRecord(hit);
    return (
      typeof candidate?.id === "string" && typeof candidate?.title === "string"
    );
  });
}

/**
 * Ordered, de-duplicated list of every chunk retrieved in a message. This is
 * the citation key: [1] refers to the first entry, and so on.
 */
export function collectSources(message: UIMessage): CitedChunk[] {
  const seen = new Set<string>();
  const sources: CitedChunk[] = [];

  for (const part of message.parts) {
    if (!isToolPart(part)) continue;
    if (part.state !== "output-available") continue;

    for (const hit of extractHits(part.output)) {
      if (seen.has(hit.id)) continue;
      seen.add(hit.id);
      sources.push(hit);
    }
  }

  return sources;
}

/** The trace steps for one assistant message, in the order they happened. */
export function collectTrace(message: UIMessage): TraceStep[] {
  const steps: TraceStep[] = [];
  let sourceCursor = 0;
  const seen = new Set<string>();

  for (const [index, part] of message.parts.entries()) {
    if (!isToolPart(part)) continue;

    const name = TOOL_LABELS[part.type] ?? part.type;
    const id = part.toolCallId ?? `${part.type}-${index}`;
    const detail = describeInput(part.type, part.input);

    if (part.state === "output-error") {
      steps.push({
        id,
        name,
        state: "failed",
        detail,
        errorText: part.errorText ?? "tool error",
      });
      continue;
    }

    if (part.state !== "output-available") {
      steps.push({ id, name, state: "running", detail });
      continue;
    }

    // Number the hits to match the citation indices the reader will see.
    const hits: TraceHit[] = [];
    for (const hit of extractHits(part.output)) {
      if (!seen.has(hit.id)) {
        seen.add(hit.id);
        sourceCursor += 1;
      }
      hits.push({
        index: sourceCursor,
        title: hit.title,
        category: hit.category,
        url: typeof hit.url === "string" ? hit.url : undefined,
      });
    }

    steps.push({
      id,
      name,
      state: "done",
      detail,
      hits: hits.length > 0 ? hits : undefined,
    });
  }

  return steps;
}

/** Rough token estimate for the trace meter — display only, never billing. */
export function estimateTokens(message: UIMessage): number {
  let characters = 0;

  for (const part of message.parts) {
    if (part.type === "text") {
      characters += part.text.length;
    } else if (isToolPart(part)) {
      if (part.input) characters += JSON.stringify(part.input).length;
      if (part.output) characters += JSON.stringify(part.output).length;
    }
  }

  return Math.round(characters / 4);
}

export function estimateCost(tokens: number): string {
  return `$${(tokens * COST_PER_TOKEN_USD).toFixed(4)}`;
}
