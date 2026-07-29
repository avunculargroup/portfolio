/**
 * Replays a recorded agent stream into the real page and asserts that the
 * dossier, citation chips, source list and trace panel all render from it.
 * Needs no API key — the route is intercepted at the network layer.
 *
 * Usage: node run-ui-replay.mjs   (with `next start -p 3210` running)
 */
import { readFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

mkdirSync("./.ui-shots", { recursive: true });

const BASE = "http://localhost:3210";
const SSE = readFileSync(new URL("./fixtures/stream.sse", import.meta.url), "utf8");

const problems = [];
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium",
});

async function replay({ width, height, label, selectTraceTab }) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "x-vercel-ai-ui-message-stream": "v1",
      },
      body: SSE,
    });
  });

  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: "networkidle" });

  await page.fill("#ask-input", "Has Chris shipped production RAG?");
  await page.click('button[type="submit"]');

  // Wait for the answer to settle (source list only renders once streaming ends).
  await page.waitForSelector("ol li a", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);

  const answerText = await page
    .locator('[role="tabpanel"], div')
    .filter({ hasText: "hybrid search" })
    .first()
    .textContent()
    .catch(() => null);

  if (!answerText || !answerText.includes("hybrid search")) {
    problems.push(`[${label}] answer text not rendered`);
  }

  // Citation chips must be links into the source list.
  const chipCount = await page.locator('a[aria-label^="Source "]').count();
  if (chipCount < 2) {
    problems.push(`[${label}] expected >=2 citation chips, got ${chipCount}`);
  }

  const sourceCount = await page.locator('ol li span + span').count();
  const sourcesVisible = await page
    .getByText("Sources", { exact: true })
    .isVisible()
    .catch(() => false);
  if (!sourcesVisible) problems.push(`[${label}] source list not shown`);

  if (selectTraceTab) {
    await page.locator('[role="tab"]').nth(1).click();
    await page.waitForTimeout(300);
  }

  const traceText = await page.locator("aside").first().textContent();
  if (!traceText?.includes("search_experience")) {
    problems.push(`[${label}] trace panel missing search_experience step`);
  }
  if (!/steps\s*1/.test(traceText ?? "")) {
    problems.push(`[${label}] trace footer step count wrong: ${traceText?.slice(-60)}`);
  }

  await page.screenshot({
    path: `./.ui-shots/replay-${label}.png`,
    fullPage: false,
  });

  if (errors.length) problems.push(`[${label}] JS errors: ${errors.join(" | ")}`);
  await ctx.close();
  return { chipCount, sourceCount };
}

const desktop = await replay({
  width: 1280,
  height: 1000,
  label: "desktop",
  selectTraceTab: false,
});
console.log("desktop chips:", desktop.chipCount);

await replay({ width: 390, height: 900, label: "mobile", selectTraceTab: true });

await browser.close();

if (problems.length) {
  console.log("PROBLEMS:");
  for (const p of problems) console.log(" - " + p);
  process.exit(1);
}
console.log("UI replay checks passed.");
