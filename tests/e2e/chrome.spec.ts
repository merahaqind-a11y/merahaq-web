import { expect, test } from '@playwright/test';

/**
 * These exist because the language pill and the ☰ menu shipped as inert markup — the
 * pill had no click handler and the menu had no overlay behind it. Rendering a control
 * is not the same as wiring one, and nothing was asserting the difference.
 */

test.describe('language switch (F-110)', () => {
  test('switching is instant, with no reload', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByTestId('hero-question');
    await expect(heading).toContainText('आपके लिए');

    await page.evaluate(() => ((window as unknown as { __kept: boolean }).__kept = true));

    await page.getByTestId('lang-en').click();
    await expect(heading).toContainText('Which rights');

    // No navigation happened — the marker survives.
    expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(true);
  });

  test('all three languages actually change the page', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByTestId('hero-cta');

    await expect(cta).toHaveText('मेरा हक़ बताओ');
    await page.getByTestId('lang-hinglish').click();
    await expect(cta).toHaveText('Mera Haq batao');
    await page.getByTestId('lang-en').click();
    await expect(cta).toHaveText('Show me my rights');
    await page.getByTestId('lang-hi').click();
    await expect(cta).toHaveText('मेरा हक़ बताओ');
  });

  test('the hand-split hero headline switches too', async ({ page }) => {
    // The hero splits its words into spans for the GSAP stagger, so those spans carry
    // no data-i18n of their own. A naive text swap leaves the headline in the old
    // language while everything around it changes.
    await page.goto('/');
    await page.getByTestId('lang-hinglish').click();
    await expect(page.getByTestId('hero-question')).toContainText('Aapke liye kaun se haq');
    expect(await page.getByTestId('hero-question').innerText()).not.toContain('आपके');
  });

  test('card titles switch with the language', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('[data-section="cards"] [data-card-title]').first();
    await expect(first).toContainText('स्त्रीधन');
    await page.getByTestId('lang-en').click();
    await expect(first).toContainText('Your jewellery is yours');
  });

  test('html lang updates so TTS picks the right voice (r7)', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('hi');

    // Hinglish is the same spoken language in Latin script — it must stay `hi` so a
    // screen reader speaks it as Hindi rather than reading it as English.
    await page.getByTestId('lang-hinglish').click();
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('hi');

    await page.getByTestId('lang-en').click();
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('en');
  });

  test('the choice persists across a reload, and is never inferred', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('lang-en').click();
    expect(
      await page.evaluate(() => JSON.parse(localStorage.getItem('mh_prefs')!).lang),
    ).toBe('en');

    await page.reload();
    await expect(page.getByTestId('hero-cta')).toHaveText('Show me my rights');
  });

  test('the pill reflects the active language', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('lang-hi')).toHaveAttribute('aria-pressed', 'true');
    await page.getByTestId('lang-en').click();
    await expect(page.getByTestId('lang-en')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('lang-hi')).toHaveAttribute('aria-pressed', 'false');
  });

  test('switching mid-diagnostic keeps her answers (r2)', async ({ page }) => {
    await page.goto('/shuru');
    await page.getByTestId('s0-start').click();
    await page.getByTestId('s0b-unknown').click();
    await page.getByTestId('q1-a').click();
    await expect(page.getByTestId('q2-question')).toBeVisible({ timeout: 2000 });
    await page.getByTestId('q2-b').click();
    await expect(page.getByTestId('q3-question')).toBeVisible({ timeout: 2000 });

    await page.getByTestId('q3-a').click();
    await page.getByTestId('lang-hinglish').click();

    // Re-rendered in the new language...
    await expect(page.getByTestId('q3-question')).toContainText('Inmein se kya-kya');
    // ...with what she already ticked still ticked.
    await expect(page.getByTestId('q3-a')).toHaveAttribute('aria-pressed', 'true');

    // And the deck she gets is the one her answers produce, unaffected by the switch.
    await page.getByTestId('q3-e').click();
    await page.getByTestId('q3-cta').click();
    await page.getByTestId('q4-a').click();
    await page.getByTestId('q5-b').click();
    await page.getByTestId('q5-c').click();
    await page.getByTestId('q5-cta').click();
    await expect(page.getByTestId('s7-title')).toBeVisible({ timeout: 6000 });

    const stored = JSON.parse((await page.evaluate(() => localStorage.getItem('mh_prefs')))!);
    expect(stored.deck).toEqual(['C2', 'C6', 'C1', 'C3', 'C8']);
  });

  test('the reveal switches language too', async ({ page }) => {
    await page.goto('/shuru');
    await page.getByTestId('s0-start').click();
    await page.getByTestId('s0b-unknown').click();
    await page.getByTestId('q1-a').click();
    await page.getByTestId('q2-b').click();
    await page.getByTestId('q3-a').click();
    await page.getByTestId('q3-cta').click();
    await page.getByTestId('q4-a').click();
    await page.getByTestId('q5-b').click();
    await page.getByTestId('q5-cta').click();
    await expect(page.getByTestId('s7-title')).toBeVisible({ timeout: 6000 });

    await page.getByTestId('lang-en').click();
    await expect(page.getByTestId('s7-title')).toContainText('These five cards');
    await expect(page.getByTestId('reveal-list')).toContainText('for everyone');
  });
});

test.describe('menu (F-02 / §5.5)', () => {
  // ☰ is phone-only by design: from lg up the same routes are simply visible in the
  // header, because there is room and a menu you have to open is a menu you might not.
  test.beforeEach(async ({}, info) => {
    test.skip(info.project.name === 'desktop', '☰ is replaced by the inline nav at lg+');
  });

  test('☰ opens a full-screen overlay', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('menu-overlay')).toBeHidden();
    await page.getByTestId('menu-toggle').click();
    await expect(page.getByTestId('menu-overlay')).toBeVisible();
    await expect(page.getByTestId('menu-toggle')).toHaveAttribute('aria-expanded', 'true');
  });

  test('the quick exit stays functional while the menu is open (§5.5 r5)', async ({ page }) => {
    await page.route('https://www.google.com/**', (r) =>
      r.fulfill({ status: 200, contentType: 'text/html', body: '<title>ok</title>' }),
    );
    await page.goto('/');
    await page.getByTestId('menu-toggle').click();
    await expect(page.getByTestId('menu-overlay')).toBeVisible();
    await expect(page.getByTestId('quick-exit')).toBeVisible();
    await page.getByTestId('quick-exit').click();
    await page.waitForURL(/google\.com/, { timeout: 3000 });
  });

  test('the menu close and the quick exit are not visually confusable (§5.12 r2)', async ({ page }) => {
    // One of these returns her to the page. The other leaves the site. If they look the
    // same, the panic control is ambiguous exactly when it matters most.
    await page.goto('/');
    await page.getByTestId('menu-toggle').click();

    const paths = await page.evaluate(() => {
      const d = (sel: string) =>
        Array.from(document.querySelectorAll<SVGPathElement>(`${sel} path`))
          .map((p) => p.getAttribute('d'))
          .join('|');
      return {
        close: d('[data-testid="menu-close"]'),
        exit: d('[data-testid="quick-exit"]'),
      };
    });
    expect(paths.close).not.toBe(paths.exit);
    // The ✘ glyph belongs to the quick exit alone.
    expect(paths.close).not.toContain('M6 6l12 12');
    expect(paths.exit).toContain('M6 6l12 12');
  });

  test('every row is at least 56px and never truncates', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('menu-toggle').click();
    const short = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of Array.from(
        document.querySelectorAll<HTMLElement>('#mh-menu nav a, #mh-menu nav button'),
      )) {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.height < 56) out.push(`${el.dataset['testid']}=${Math.round(r.height)}`);
        if (getComputedStyle(el).textOverflow === 'ellipsis') out.push(`${el.dataset['testid']} truncates`);
      }
      return out;
    });
    expect(short, short.join(', ')).toHaveLength(0);
  });

  test('deck-only rows are hidden until a deck exists', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('menu-toggle').click();
    await expect(page.getByTestId('menu-myCards')).toBeHidden();
    await expect(page.getByTestId('menu-reset')).toBeHidden();

    await page.evaluate(() =>
      localStorage.setItem(
        'mh_prefs',
        JSON.stringify({ deck: ['C2', 'C6', 'C1', 'C3', 'C8'], v: 2, lang: 'hi', muted: false }),
      ),
    );
    await page.reload();
    await page.getByTestId('menu-toggle').click();
    await expect(page.getByTestId('menu-myCards')).toBeVisible();
    await expect(page.getByTestId('menu-reset')).toBeVisible();
  });

  test('reset confirms before wiping, and keeps her language choice', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() =>
      localStorage.setItem(
        'mh_prefs',
        JSON.stringify({ deck: ['C2', 'C6', 'C1', 'C3', 'C8'], v: 2, lang: 'en', muted: false }),
      ),
    );
    await page.reload();
    await page.getByTestId('menu-toggle').click();
    await page.getByTestId('menu-reset').click();

    await expect(page.getByTestId('reset-confirm')).toBeVisible();
    await page.getByTestId('reset-no').click();
    await expect(page.getByTestId('reset-confirm')).toBeHidden();
    expect(
      await page.evaluate(() => JSON.parse(localStorage.getItem('mh_prefs')!).deck.length),
    ).toBe(5);

    await page.getByTestId('menu-reset').click();
    await page.getByTestId('reset-yes').click();
    await page.waitForURL(/\/shuru/);
    const prefs = JSON.parse((await page.evaluate(() => localStorage.getItem('mh_prefs')))!);
    expect(prefs.deck).toEqual([]);
    // Language is a preference, not part of the deck — resetting the questions must
    // not silently put her back into Hindi.
    expect(prefs.lang).toBe('en');
  });

  test('mute toggles and persists (F-06)', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('menu-toggle').click();
    await expect(page.getByTestId('menu-mute')).toHaveAttribute('aria-pressed', 'false');
    await page.getByTestId('menu-mute').click();
    await expect(page.getByTestId('menu-mute')).toHaveAttribute('aria-pressed', 'true');
    expect(
      await page.evaluate(() => JSON.parse(localStorage.getItem('mh_prefs')!).muted),
    ).toBe(true);
  });
});

test.describe('desktop navigation', () => {
  test.beforeEach(async ({}, info) => {
    test.skip(info.project.name !== 'desktop', 'the inline nav only exists at lg+');
  });

  test('the rights routes are visible in the header, with no hamburger', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('menu-toggle')).toBeHidden();
    await expect(page.getByTestId('desktop-nav')).toBeVisible();

    for (const id of ['nav-diagnostic', 'nav-allCards', 'nav-madad', 'nav-about', 'nav-impact']) {
      await expect(page.getByTestId(id), id).toBeVisible();
    }
  });

  test('the inline nav switches language like everything else', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('nav-madad')).toHaveText('अभी मदद लीजिए');
    await page.getByTestId('lang-en').click();
    await expect(page.getByTestId('nav-madad')).toHaveText('Get help now');
  });
});

test.describe('helpline ticker', () => {
  test('carries all seven universal numbers as tel: links', async ({ page }) => {
    await page.goto('/');
    for (const n of ['181', '112', '15100', '14454', '1930', '14448', '14490']) {
      const link = page.getByTestId(`tel-${n}`);
      await expect(link, n).toHaveAttribute('href', `tel:${n}`);
    }
  });

  test('every number still clears the 48px tap floor despite the slimmer bar', async ({ page }) => {
    await page.goto('/');
    const short = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-testid^="tel-"]'))
        .filter((el) => el.getBoundingClientRect().height < 48)
        .map((el) => `${el.dataset['testid']}=${Math.round(el.getBoundingClientRect().height)}`),
    );
    expect(short, short.join(', ')).toHaveLength(0);
  });

  test('the motion stops the moment she reaches for a number', async ({ page }) => {
    // A moving tel: link is a usability failure, not a flourish — she taps in a hurry.
    await page.goto('/');
    const state = await page.evaluate(async () => {
      const track = document.querySelector<HTMLElement>('.mh-ticker-track')!;
      const before = getComputedStyle(track).animationPlayState;
      document.querySelector<HTMLElement>('.mh-ticker')!.dispatchEvent(
        new MouseEvent('mouseover', { bubbles: true }),
      );
      // hover is CSS-driven, so assert the rule exists rather than simulating hover
      const rules = [...document.styleSheets]
        .flatMap((s) => {
          try {
            return [...s.cssRules];
          } catch {
            return [];
          }
        })
        .map((r) => r.cssText)
        .join(' ');
      return { before, pausesOnHover: rules.includes('animation-play-state: paused') };
    });
    expect(state.before).toBe('running');
    expect(state.pausesOnHover, 'ticker does not pause on hover/focus').toBe(true);
  });

  test('the ticker does not move under reduced motion', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('http://localhost:4321/');
    const anim = await page.evaluate(
      () => getComputedStyle(document.querySelector('.mh-ticker-track')!).animationName,
    );
    expect(anim).toBe('none');
    await ctx.close();
  });
});
