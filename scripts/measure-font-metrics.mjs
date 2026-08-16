import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

/**
 * Measures the optical relationship between Montserrat (Latin) and Mukta (Devanagari)
 * and emits a `size-adjust` for Mukta's @font-face — or 100% when none is warranted.
 *
 * Why this exists: Montserrat has no Devanagari glyphs, so every Hindi page is a
 * mixed-script page. If the two families disagree on optical size, a line like
 * «PMJDY खाता खोलें» reads as two fonts fighting rather than one sentence.
 *
 * Why it measures in a browser rather than reading font tables: @fontsource ships
 * woff2 only, and woff2 is a Brotli container with a transformed glyf table — reading
 * OS/2 out of it needs a full woff2 decoder. Measuring through Chromium's shaper is
 * simpler and strictly more accurate: it measures what the browser will actually draw.
 *
 * WHAT WE COMPARE, and why it is not x-height. The instinct is to match Latin x-height,
 * but that is wrong for Devanagari. Devanagari's body runs from the baseline to the
 * शिरोरेखा — the horizontal stroke across the top of every word — and it reads correctly
 * when that height sits just under Latin cap height, not at x-height. Matching to
 * x-height shrinks Devanagari to ~84% and looks broken.
 *
 * WHAT WE DO NOT EMIT: ascent-override / descent-override. Mukta's line metrics are
 * much taller than Montserrat's (1.66em vs 1.22em) because मात्रा stack above the
 * शिरोरेखा and below the baseline. Clamping them to Montserrat's would collide lines.
 * global.css sets an explicit unitless line-height, which makes the font's own ascent
 * and descent irrelevant to line box height anyway — so the overrides are pure risk.
 */

const MONTSERRAT = 'node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2';
const MUKTA = 'node_modules/@fontsource/mukta/files/mukta-devanagari-400-normal.woff2';

/** Devanagari base height as a fraction of Latin cap height. */
const BAND = { min: 0.85, max: 1.0 };
const TARGET = 0.92;

const b64 = (p) => readFileSync(p).toString('base64');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><meta charset="utf-8"><canvas id="c"></canvas>');

// The fonts are loaded as bytes through the FontFace API rather than @font-face.
// Setting ctx.font alone does not trigger a font fetch — do that and you silently
// measure the system fallback, which on Windows has Devanagari and so never errors.
const m = await page.evaluate(
  async ({ mb, kb }) => {
    const bytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)).buffer;
    const fm = new FontFace('M', bytes(mb));
    const fk = new FontFace('K', bytes(kb));
    await fm.load();
    await fk.load();
    document.fonts.add(fm);
    document.fonts.add(fk);
    if (!document.fonts.check('100px M') || !document.fonts.check('100px K')) {
      throw new Error('fonts did not register');
    }

    const ctx = document.querySelector('canvas').getContext('2d');
    const at = (font, ch) => {
      ctx.font = font;
      const t = ctx.measureText(ch);
      return {
        ascent: t.actualBoundingBoxAscent,
        descent: t.actualBoundingBoxDescent,
        fontAscent: t.fontBoundingBoxAscent,
        fontDescent: t.fontBoundingBoxDescent,
      };
    };

    return {
      latinX: at('100px M', 'x').ascent,
      latinCap: at('100px M', 'H').ascent,
      latinLine: at('100px M', 'H').fontAscent + at('100px M', 'H').fontDescent,
      // 'क' carries no मात्रा, so its ascent is exactly baseline → शिरोरेखा.
      devaBase: at('100px K', 'क').ascent,
      devaLine: at('100px K', 'क').fontAscent + at('100px K', 'क').fontDescent,
      // Acid test. Both must shape taller than the bare base height, which only
      // happens if the conjunct and the nukta form actually composed.
      conjunct: at('100px K', 'स्त्रीधन').ascent,
      nukta: at('100px K', 'ज़िंदगी').ascent,
    };
  },
  { mb: b64(MONTSERRAT), kb: b64(MUKTA) },
);

await browser.close();

// स्त्रीधन and ज़िंदगी must both compose above the bare base height. If either equals
// the base height, the conjunct or the nukta failed to shape and the font is unusable
// for this product — that is the single most important thing this script proves.
if (m.conjunct <= m.devaBase || m.nukta <= m.devaBase) {
  throw new Error(
    `conjunct shaping failed: क=${m.devaBase} स्त्रीधन=${m.conjunct} ज़िंदगी=${m.nukta}`,
  );
}

const ratio = m.devaBase / m.latinCap;
const inBand = ratio >= BAND.min && ratio <= BAND.max;
const sizeAdjust = inBand ? 100 : (TARGET / ratio) * 100;

const verdict = inBand
  ? `Devanagari base height is ${(ratio * 100).toFixed(1)}% of Latin cap height, inside the
 * ${BAND.min * 100}–${BAND.max * 100}% band where the two scripts read as one size. No
 * adjustment is warranted, and applying one would make the pairing worse.`
  : `Devanagari base height is ${(ratio * 100).toFixed(1)}% of Latin cap height, OUTSIDE the
 * ${BAND.min * 100}–${BAND.max * 100}% band. Correcting to ${TARGET * 100}% of cap height.`;

const css = `/* GENERATED by scripts/measure-font-metrics.mjs — do not edit by hand.
 *
 * Measured through Chromium's own shaper at 100px:
 *   Montserrat  x-height        ${m.latinX.toFixed(1)}px
 *   Montserrat  cap-height      ${m.latinCap.toFixed(1)}px
 *   Montserrat  line metrics    ${m.latinLine.toFixed(1)}px
 *   Mukta       क base height   ${m.devaBase.toFixed(1)}px   (baseline → शिरोरेखा)
 *   Mukta       line metrics    ${m.devaLine.toFixed(1)}px
 *
 * ${verdict}
 *
 * Conjunct acid test passed: स्त्रीधन shaped to ${m.conjunct.toFixed(1)}px and ज़िंदगी to
 * ${m.nukta.toFixed(1)}px, both above the ${m.devaBase.toFixed(1)}px bare base height, so
 * the conjunct and the nukta form both composed.
 *
 * Re-run \`npm run metrics\` after any font version bump.
 */
:root {
  --mukta-size-adjust: ${sizeAdjust.toFixed(2)}%;
}
`;

writeFileSync('src/styles/font-metrics.generated.css', css);

console.log(`Montserrat x-height    ${m.latinX.toFixed(1)}px`);
console.log(`Montserrat cap-height  ${m.latinCap.toFixed(1)}px`);
console.log(`Mukta क base height    ${m.devaBase.toFixed(1)}px`);
console.log(`ratio to cap-height    ${(ratio * 100).toFixed(1)}%  ${inBand ? '(in band)' : '(OUT OF BAND)'}`);
console.log(`→ size-adjust          ${sizeAdjust.toFixed(2)}%`);
console.log(`conjunct स्त्रीधन       ${m.conjunct.toFixed(1)}px ✓`);
console.log(`nukta ज़िंदगी           ${m.nukta.toFixed(1)}px ✓`);
