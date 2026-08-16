import { expect, test } from '@playwright/test';

/**
 * The above-the-fold rule is a PRD hard requirement (§5.4 r1 and r6), not a nicety:
 * someone may arrive here in the worst hour of her life, and the question, the action
 * and the phone numbers must all be reachable without a scroll on a 5-inch screen.
 */
test.describe('home', () => {
  test('hero, CTA, escape link and helpline all clear the fold at 360×740', async ({ page }, info) => {
    test.skip(info.project.name !== 'sunita', 'the fold rule is specified for Sunita’s phone');

    await page.goto('/');
    const vh = page.viewportSize()!.height;

    for (const id of ['helpline-strip', 'hero-question', 'sunie', 'hero-cta', 'hero-escape']) {
      const box = (await page.getByTestId(id).boundingBox())!;
      expect(box, `${id} not rendered`).toBeTruthy();
      expect(box.y + box.height, `${id} falls below the fold`).toBeLessThanOrEqual(vh);
    }
  });

  test('the primary CTA is at least 56px tall and full width on mobile', async ({ page }, info) => {
    test.skip(info.project.name !== 'sunita');
    await page.goto('/');
    const cta = (await page.getByTestId('hero-cta').boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(cta.height).toBeGreaterThanOrEqual(56);
    expect(cta.width).toBeGreaterThan(vw * 0.8);
  });

  test('every interactive control meets the 48px floor', async ({ page }) => {
    await page.goto('/');
    const undersized = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of Array.from(document.querySelectorAll('a, button, [role="button"]'))) {
        const r = el.getBoundingClientRect();
        if (r.height === 0 && r.width === 0) continue; // hidden
        if (r.height < 48) {
          const el2 = el as HTMLElement;
          out.push(`${el2.dataset['testid'] ?? el2.textContent?.trim().slice(0, 24)} = ${Math.round(r.height)}px`);
        }
      }
      return out;
    });
    expect(undersized, `controls under 48px: ${undersized.join(', ')}`).toHaveLength(0);
  });

  test('exactly one pink-600 action, and pink-500 never carries text', async ({ page }) => {
    await page.goto('/');
    const found = await page.evaluate(() => {
      const hex = (c: string) => {
        const m = c.match(/\d+/g);
        return m
          ? '#' + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()
          : '';
      };
      let fills = 0;
      let textFails = 0;
      for (const el of Array.from(document.querySelectorAll('*'))) {
        const cs = getComputedStyle(el);
        if (el.matches('a, button, [role="button"]') && hex(cs.backgroundColor) === '#D6336C') fills++;
        const hasText = Array.from(el.childNodes).some(
          (n) => n.nodeType === 3 && (n.textContent ?? '').trim().length > 0,
        );
        if (hasText && hex(cs.color) === '#FF4081') textFails++;
      }
      return { fills, textFails };
    });
    expect(found.fills, 'more than one pink-600 action on screen').toBe(1);
    expect(found.textFails, 'pink-500 used as a text colour').toBe(0);
  });

  test('the three fixed controls hold their positions', async ({ page }) => {
    await page.goto('/');
    const vw = page.viewportSize()!.width;
    const menu = (await page.getByTestId('menu-toggle').boundingBox())!;
    const exit = (await page.getByTestId('quick-exit').boundingBox())!;
    const pill = (await page.getByTestId('lang-pill').boundingBox())!;

    expect(menu.x, 'menu not top-left').toBeLessThan(80);
    expect(menu.y, 'menu not at the top').toBeLessThan(80);
    expect(exit.x + exit.width, 'exit not top-right').toBeGreaterThan(vw - 80);
    expect(exit.y, 'exit not at the top').toBeLessThan(80);

    const pillCentre = pill.x + pill.width / 2;
    expect(pillCentre, 'pill not near centre').toBeGreaterThan(vw * 0.25);
    expect(pillCentre, 'pill not near centre').toBeLessThan(vw * 0.75);
  });

  test('no third-party requests and no cookies', async ({ page, context }) => {
    const foreign: string[] = [];
    page.on('request', (r) => {
      const url = new URL(r.url());
      if (!['localhost', '127.0.0.1'].includes(url.hostname) && url.protocol !== 'data:') {
        foreign.push(r.url());
      }
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(foreign, `third-party requests: ${foreign.join(', ')}`).toHaveLength(0);
    expect(await context.cookies()).toHaveLength(0);
  });

  test('no audio plays without a gesture', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    const playing = await page.evaluate(() =>
      Array.from(document.querySelectorAll('audio')).some((a) => !a.paused),
    );
    expect(playing).toBe(false);
  });

  test('quick exit leaves in under 100ms', async ({ page }) => {
    // The destination is stubbed so this measures OUR latency — the handler firing and
    // the navigation starting — rather than google.com's time to first byte, which we
    // neither control nor have on a test machine with no internet.
    await page.route('https://www.google.com/**', (r) =>
      r.fulfill({ status: 200, contentType: 'text/html', body: '<title>ok</title>' }),
    );
    await page.goto('/');
    const start = Date.now();
    await page.getByTestId('quick-exit').click();
    await page.waitForURL(/google\.com/, { timeout: 3000 });
    expect(Date.now() - start, 'quick exit latency').toBeLessThan(100);
  });

  test('quick exit works with every script blocked', async ({ page }) => {
    // She may tap this before hydration, on a dead connection, mid-paint. The handler
    // is an inline head script bound at capture phase precisely so it never waits.
    await page.route('https://www.google.com/**', (r) =>
      r.fulfill({ status: 200, contentType: 'text/html', body: '<title>ok</title>' }),
    );
    await page.route('**/*.js', (r) => r.abort());
    await page.goto('/');
    await page.getByTestId('quick-exit').click();
    await page.waitForURL(/google\.com/, { timeout: 3000 });
  });

  test('quick exit works while the menu overlay is open', async ({ page }) => {
    await page.route('https://www.google.com/**', (r) =>
      r.fulfill({ status: 200, contentType: 'text/html', body: '<title>ok</title>' }),
    );
    await page.goto('/');
    await page.getByTestId('menu-toggle').click();
    await page.getByTestId('quick-exit').click();
    await page.waitForURL(/google\.com/, { timeout: 3000 });
  });

  test('Devanagari is not machine-translated away', async ({ page }) => {
    await page.goto('/');
    const state = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      translated: document.documentElement.classList.contains('translated-ltr'),
      heading: document.querySelector('[data-testid="hero-question"]')?.textContent ?? '',
    }));
    expect(state.lang).toBe('hi');
    expect(state.translated).toBe(false);
    expect(/[ऀ-ॿ]/.test(state.heading), 'hero heading lost its Devanagari').toBe(true);
  });
});
