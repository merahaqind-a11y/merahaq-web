import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

/**
 * Review screenshots at the three widths that matter:
 *   360×740  Sunita's phone — the primary design target
 *   768      a facilitator's tablet
 *   1440     the supporter who arrived from a share
 *
 * Usage: node scripts/shots.mjs [route] [outdir]
 */
const route = process.argv[2] ?? '/';
const outDir = process.argv[3] ?? 'review';
const base = process.env.SHOT_BASE ?? 'http://localhost:4321';

const WIDTHS = [
  { w: 360, h: 740, name: '360-sunita' },
  { w: 768, h: 1024, name: '768-tablet' },
  { w: 1440, h: 900, name: '1440-desktop' },
];

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const slug = route === '/' ? 'home' : route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

for (const { w, h, name } of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto(base + route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  // Fold view — what she actually sees before scrolling. Captured BEFORE scrolling so
  // it shows the true first impression.
  await page.screenshot({ path: `${outDir}/${slug}-${name}-fold.png` });

  // Scroll the whole page first. A fullPage capture does not fire scroll-triggered
  // reveals, so without this the shot shows every animated section as blank and the
  // review is worthless — it looks like a broken page rather than an unscrolled one.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });

  await page.screenshot({ path: `${outDir}/${slug}-${name}-full.png`, fullPage: true });

  console.log(`${slug} @ ${w}×${h}`);
  await page.close();
}

// Reduced-motion pass, so both modes are on the record.
const rm = await browser.newContext({
  viewport: { width: 360, height: 740 },
  deviceScaleFactor: 2,
  reducedMotion: 'reduce',
});
const rmPage = await rm.newPage();
await rmPage.goto(base + route, { waitUntil: 'networkidle' });
await rmPage.evaluate(() => document.fonts.ready);
await rmPage.waitForTimeout(600);
await rmPage.screenshot({ path: `${outDir}/${slug}-360-reduced-motion.png` });
console.log(`${slug} @ 360 reduced-motion`);

await browser.close();
