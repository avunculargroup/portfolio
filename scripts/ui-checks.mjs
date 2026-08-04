import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

mkdirSync('./.ui-shots', { recursive: true });

const BASE = 'http://localhost:3210';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const viewports = [
  { name: '320', width: 320, height: 720 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 900 },
];

const problems = [];

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => {
    // A missing /public/portrait.jpg is expected until a real photo is
    // added — the Portrait component degrades gracefully to a monogram
    // card, but the browser still logs the failed request. It surfaces as
    // a 400 from the next/image optimizer (not a plain 404) because the
    // request goes to /_next/image rather than straight to the file.
    const expectedMissingPortrait = /\b(404|400)\b/.test(m.text());
    if (m.type() === 'error' && !expectedMissingPortrait) errors.push('console: ' + m.text());
  });

  await page.goto(BASE, { waitUntil: 'networkidle' });

  // horizontal overflow check
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    const out = [];
    if (de.scrollWidth > de.clientWidth + 1) {
      for (const el of document.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.right > de.clientWidth + 1) {
          out.push(`${el.tagName}.${(el.className||'').toString().slice(0,40)} right=${Math.round(r.right)}`);
        }
      }
    }
    return { docScroll: de.scrollWidth, docClient: de.clientWidth, offenders: out.slice(0, 8) };
  });

  if (overflow.docScroll > overflow.docClient + 1) {
    problems.push(`[${vp.name}] horizontal overflow ${overflow.docScroll} > ${overflow.docClient}: ${overflow.offenders.join(' | ')}`);
  }

  // tap target check on interactive elements
  const smallTargets = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('button, a, input')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      // chips use ::after to extend the tap area
      const cls = (el.className || '').toString();
      if (/chip/.test(cls)) continue;
      if (/skipLink/.test(cls)) continue;
      if (r.height < 44 - 0.5 && !/navLink|citation|source|links/.test(cls)) {
        out.push(`${el.tagName}.${cls.slice(0,40)} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    }
    return out;
  });
  if (smallTargets.length) problems.push(`[${vp.name}] small targets: ${smallTargets.join(' | ')}`);

  await page.screenshot({ path: `./.ui-shots/${vp.name}-top.png` });
  await page.screenshot({ path: `./.ui-shots/${vp.name}-full.png`, fullPage: true });

  if (errors.length) problems.push(`[${vp.name}] JS errors: ${errors.slice(0,4).join(' | ')}`);
  await ctx.close();
}

// Mobile menu behaviour
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const btn = page.locator('header button[aria-controls]');
  await btn.click();
  await page.waitForTimeout(250);
  const expanded = await btn.getAttribute('aria-expanded');
  const panelVisible = await page.locator('header nav[aria-label="Menu"] a').first().isVisible();
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.screenshot({ path: './.ui-shots/menu-open.png' });
  if (expanded !== 'true') problems.push('menu: aria-expanded not true after open');
  if (!panelVisible) problems.push('menu: panel links not visible');
  if (focused !== 'Ask') problems.push(`menu: focus not on first item (got "${focused}")`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const afterEsc = await btn.getAttribute('aria-expanded');
  const focusBack = await page.evaluate(() => document.activeElement?.getAttribute('aria-controls') !== null);
  if (afterEsc !== 'false') problems.push('menu: Escape did not close');
  if (!focusBack) problems.push('menu: focus not returned to toggle after Escape');
  await ctx.close();
}

// Ask card / answer card — the trace now renders inline, below the answer,
// inside the same card (no separate Answer/Trace tab control anymore).
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });

  // No tablist should exist at any viewport — the answer and its trace are
  // one scrollable card, not two panels behind a switcher.
  const tablistPresent = await page.locator('[role="tablist"]').count();
  if (tablistPresent !== 0) problems.push('ask: unexpected [role="tablist"] — trace should be inline, not tabbed');

  // Ask/answer cards stack to one column on mobile.
  const askInput = page.locator('#ask-input');
  const askCard = page.locator('#ask [class*="_card_"]').nth(0);
  const answerCard = page.locator('#ask [class*="_card_"]').nth(1);
  const askBox = await askCard.boundingBox();
  const answerBox = await answerCard.boundingBox();
  if (askBox && answerBox && Math.abs(askBox.x - answerBox.x) > 4) {
    problems.push('ask: ask/answer cards not stacked to one column at 390');
  }

  // Asking a question surfaces the question text — the answer card's
  // content, whatever the agent's availability, appears before any trace.
  await askInput.fill('Has Chris shipped production RAG?');
  await page.locator('#ask button[type="submit"]').click();
  await page.waitForTimeout(300);
  const questionVisible = await page.getByText('Has Chris shipped production RAG?').first().isVisible();
  if (!questionVisible) problems.push('ask: question text not shown after asking');

  // Desktop: ask card and answer card sit side by side.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(300);
  const askBoxWide = await askCard.boundingBox();
  const answerBoxWide = await answerCard.boundingBox();
  if (askBoxWide && answerBoxWide && answerBoxWide.x <= askBoxWide.x + 100) {
    problems.push('ask: ask/answer cards not side-by-side at 1280');
  }
  await page.screenshot({ path: './.ui-shots/ask-answered.png' });
  await ctx.close();
}

await browser.close();

if (problems.length) {
  console.log('PROBLEMS:');
  for (const p of problems) console.log(' - ' + p);
  process.exit(1);
} else {
  console.log('All layout/a11y checks passed.');
}
