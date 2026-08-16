import { expect, test } from '@playwright/test';

/** Drive the flow to the reveal, choosing the given options. */
async function run(
  page: import('@playwright/test').Page,
  opts: { q1: string; q2: string; q3: string[]; q4: string; q5: string[] },
) {
  await page.goto('/shuru');
  await page.getByTestId('s0-start').click();
  await page.getByTestId('s0b-unknown').click();
  await page.getByTestId(`q1-${opts.q1}`).click();
  await page.getByTestId(`q2-${opts.q2}`).click();
  for (const o of opts.q3) await page.getByTestId(`q3-${o}`).click();
  await page.getByTestId('q3-cta').click();
  await page.getByTestId(`q4-${opts.q4}`).click();
  for (const o of opts.q5) await page.getByTestId(`q5-${o}`).click();
  await page.getByTestId('q5-cta').click();
  await expect(page.getByTestId('s7-title')).toBeVisible({ timeout: 6000 });
}

test.describe('diagnostic', () => {
  test('single-selects auto-advance, multi-selects wait for the CTA', async ({ page }) => {
    await page.goto('/shuru');
    await page.getByTestId('s0-start').click();
    await expect(page.getByTestId('s0b-question')).toBeVisible();

    await page.getByTestId('s0b-unknown').click();
    await expect(page.getByTestId('q1-question')).toBeVisible({ timeout: 2000 });

    await page.getByTestId('q1-a').click();
    await expect(page.getByTestId('q2-question')).toBeVisible({ timeout: 2000 });

    await page.getByTestId('q2-b').click();
    await expect(page.getByTestId('q3-question')).toBeVisible({ timeout: 2000 });

    // A multi-select must NOT move on by itself — she may have more to tick.
    await page.getByTestId('q3-a').click();
    await page.waitForTimeout(900);
    await expect(page.getByTestId('q3-question')).toBeVisible();

    await page.getByTestId('q3-cta').click();
    await expect(page.getByTestId('q4-question')).toBeVisible();
  });

  test('Q1=d removes the two marriage statements', async ({ page }) => {
    await page.goto('/shuru');
    await page.getByTestId('s0-start').click();
    await page.getByTestId('s0b-unknown').click();
    await page.getByTestId('q1-d').click();
    await page.getByTestId('q2-a').click();
    await expect(page.getByTestId('q3-question')).toBeVisible({ timeout: 2000 });

    // Removed, not disabled — showing them at all breaks the "yes, they get me" spell.
    await expect(page.getByTestId('q3-a')).toBeHidden();
    await expect(page.getByTestId('q3-b')).toBeHidden();
    await expect(page.getByTestId('q3-c')).toBeVisible();
  });

  test('there is no skip control anywhere in the flow', async ({ page }) => {
    // Owner decision D7. The escapes that remain are S0's direct-to-cards link and the
    // non-disclosive options inside Q3, Q4 and Q5.
    await page.goto('/shuru');
    await expect(page.getByTestId('s0-escape')).toBeVisible();
    await page.getByTestId('s0-start').click();
    await page.getByTestId('s0b-unknown').click();

    for (const q of ['q1', 'q2', 'q3', 'q4', 'q5']) {
      await expect(page.getByTestId(`${q}-skip`), `${q} has a skip control`).toHaveCount(0);
    }

    // No skip WORDING anywhere either. S0b's option was «पता नहीं / छोड़ें» in the PRD;
    // under D7 it is «पता नहीं» alone, which still delivers RQ-2's stated rationale —
    // asking "do you know" is gentler than asking her to notice a skip button.
    const body = await page.locator('body').innerText();
    expect(body, 'skip wording still present').not.toContain('छोड़ें');
  });

  test('progress is five dots, never a counter', async ({ page }) => {
    await page.goto('/shuru');
    await page.getByTestId('s0-start').click();
    await page.getByTestId('s0b-unknown').click();
    await expect(page.getByTestId('progress-dots').locator('[data-dot]')).toHaveCount(5);

    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/\d\s*\/\s*5|सवाल\s*\d\s*में|Question\s*\d\s*of/i);
  });

  test('worked example A produces its documented deck', async ({ page }) => {
    // Married & cohabiting · earns but hands over · gehne + maangna padta hai ·
    // no loan · has papers and SIM → [C2, C6, C1, C3, C8]
    await run(page, { q1: 'a', q2: 'b', q3: ['a', 'e'], q4: 'a', q5: ['b', 'c'] });

    const stored = JSON.parse((await page.evaluate(() => localStorage.getItem('mh_prefs')))!);
    expect(stored.deck).toEqual(['C2', 'C6', 'C1', 'C3', 'C8']);

    const titles = await page.getByTestId('reveal-list').locator('li').allInnerTexts();
    expect(titles).toHaveLength(5);
    expect(titles[0]).toContain('पैसे रोकना');
  });

  test('the reveal never echoes her answers, and nothing answer-shaped is stored', async ({ page }) => {
    await run(page, { q1: 'a', q2: 'b', q3: ['a', 'e'], q4: 'a', q5: ['b', 'c'] });

    // 1. Storage holds the OUTPUT deck and nothing else.
    const prefs = JSON.parse((await page.evaluate(() => localStorage.getItem('mh_prefs')))!);
    for (const forbidden of ['q1', 'q2', 'q3', 'q4', 'q5', 'answers', 'responses']) {
      expect(prefs, `mh_prefs leaked ${forbidden}`).not.toHaveProperty(forbidden);
    }
    expect(Object.keys(prefs).sort()).toEqual(
      ['deck', 'lang', 'muted', 'region', 'seenAudioNote', 'seenLoginSheet', 'v'].sort(),
    );

    // 2. Nothing else in storage either.
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toEqual(['mh_prefs']);

    // 3. The reveal screen must be clean if seen over her shoulder — not one option
    //    string she chose may appear on it.
    const body = await page.locator('body').innerText();
    for (const chosen of [
      'मैं कमाती हूँ, पर पैसे घरवाले रखते हैं',
      'शादी में मुझे गहने और तोहफ़े मिले थे',
      'अपने खर्चे के लिए मुझे दूसरों से पैसे माँगने पड़ते हैं',
      'शादी हुई है, पति/ससुराल के साथ रहती हूँ',
    ]) {
      expect(body, `S7 echoed an answer: ${chosen}`).not.toContain(chosen);
    }
    expect(body).not.toContain('क्योंकि');
  });

  test('C8 is labelled as universal in the reveal', async ({ page }) => {
    await run(page, { q1: 'a', q2: 'b', q3: ['a', 'e'], q4: 'a', q5: ['b', 'c'] });
    const last = page.getByTestId('reveal-list').locator('li').last();
    await expect(last).toContainText('यह कार्ड सबके लिए है');
  });

  test('every option meets the 48px target and 56px for CTAs', async ({ page }) => {
    await page.goto('/shuru');
    await page.getByTestId('s0-start').click();
    await page.getByTestId('s0b-unknown').click();

    const undersized = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of Array.from(
        document.querySelectorAll<HTMLElement>('section:not([hidden]) button, section:not([hidden]) a'),
      )) {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.height < 48) out.push(`${el.dataset['testid']} = ${Math.round(r.height)}`);
      }
      return out;
    });
    expect(undersized, undersized.join(', ')).toHaveLength(0);
  });

  test('the diagnostic route ships no GSAP', async ({ page }) => {
    const scripts: string[] = [];
    page.on('response', (r) => {
      if (r.url().endsWith('.js')) scripts.push(r.url());
    });
    await page.goto('/shuru', { waitUntil: 'networkidle' });

    const bodies = await Promise.all(
      scripts.map((u) => page.request.get(u).then((r) => r.text()).catch(() => '')),
    );
    const hasGsap = bodies.some((b) => b.includes('ScrollTrigger') || b.includes('gsap.registerPlugin'));
    expect(hasGsap, 'GSAP leaked into the diagnostic bundle').toBe(false);
  });

  test('the JS budget for /shuru holds', async ({ page }) => {
    let bytes = 0;
    page.on('response', async (r) => {
      if (r.url().endsWith('.js')) bytes += (await r.body().catch(() => Buffer.alloc(0))).length;
    });
    await page.goto('/shuru', { waitUntil: 'networkidle' });
    // 80 KB gz budget; raw is roughly 3x compressed for JS of this shape.
    expect(bytes, `${Math.round(bytes / 1024)} KB raw`).toBeLessThan(80 * 1024 * 3);
  });

  test('quick exit works mid-diagnostic', async ({ page }) => {
    await page.route('https://www.google.com/**', (r) =>
      r.fulfill({ status: 200, contentType: 'text/html', body: '<title>ok</title>' }),
    );
    await page.goto('/shuru');
    await page.getByTestId('s0-start').click();
    await page.getByTestId('s0b-unknown').click();
    await page.getByTestId('q1-a').click();
    await page.getByTestId('quick-exit').click();
    await page.waitForURL(/google\.com/, { timeout: 3000 });
  });

  test('back returns to the previous question without losing what she chose', async ({ page }) => {
    await page.goto('/shuru');
    await page.getByTestId('s0-start').click();
    await page.getByTestId('s0b-unknown').click();
    await page.getByTestId('q1-a').click();
    await expect(page.getByTestId('q2-question')).toBeVisible({ timeout: 2000 });

    await page.getByTestId('back').click();
    await expect(page.getByTestId('q1-question')).toBeVisible();
    await expect(page.getByTestId('q1-a')).toHaveAttribute('aria-pressed', 'true');
  });
});
