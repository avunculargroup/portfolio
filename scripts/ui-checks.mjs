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
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

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

// Answer/Trace tabs
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const tabs = page.locator('[role="tablist"] [role="tab"]');
  const count = await tabs.count();
  const firstSelected = await tabs.nth(0).getAttribute('aria-selected');
  if (count !== 2) problems.push(`tabs: expected 2 tabs, got ${count}`);
  if (firstSelected !== 'true') problems.push('tabs: Answer not selected by default');

  // Answer-first: the trace must NOT be on screen while Answer is selected.
  const traceHiddenInitially = await page.locator('aside').first().isHidden();
  if (!traceHiddenInitially) {
    problems.push('tabs: trace panel visible while Answer tab is selected');
  }

  await tabs.nth(1).click();
  await page.waitForTimeout(200);
  const traceVisible = await page.locator('aside').first().isVisible();
  if (!traceVisible) problems.push('tabs: trace panel not visible after selecting Trace');

  // And the answer pane yields when Trace is selected.
  const answerHidden = await page.locator('[role="tabpanel"]').first().isHidden();
  if (!answerHidden) problems.push('tabs: answer pane still visible on Trace tab');

  // Desktop shows both simultaneously, with no tablist.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(300);
  const tablistVisible = await page.locator('[role="tablist"]').isVisible();
  if (tablistVisible) problems.push('tabs: segmented control still shown at 1280');
  const traceOnDesktop = await page.locator('aside').first().isVisible();
  if (!traceOnDesktop) problems.push('tabs: trace panel hidden at 1280');
  await page.screenshot({ path: './.ui-shots/mobile-trace-tab.png' });
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
