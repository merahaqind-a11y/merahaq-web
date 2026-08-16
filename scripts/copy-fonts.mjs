import { copyFileSync, mkdirSync, statSync } from 'node:fs';

/**
 * Copies only the font subsets this product actually uses into public/fonts/.
 *
 * Why not just `@import '@fontsource/...'`: fontsource's index CSS pulls every subset
 * it ships — Cyrillic, Greek, Vietnamese, Latin-ext. None of that renders a single
 * glyph on this site, and every unused byte is a slower first paint on a throttled 2G
 * evening. Copying explicitly means the shipped set is a decision, not a default.
 *
 * Self-hosting is not a preference either: a font request to a third-party CDN is a
 * log entry on someone else's server, which the no-tracking principle rules out.
 */

const FONTS = [
  // Montserrat variable, Latin only. One file covers weights 400–800, so the mixed-weight
  // emphasis mechanic costs nothing extra.
  ['@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2', 'montserrat-latin-wght.woff2'],

  // Mukta, Devanagari only. TWO weights, not three: full Devanagari coverage costs
  // ~100 KB per weight, and a third weight is 100 KB of someone's data for a
  // distinction she will never consciously notice. 400 body, 700 emphasis — which is
  // exactly the mixed-weight mechanic the design system specifies. Never 800: Mukta
  // at 800 turns conjuncts to mud at display size.
  ['@fontsource/mukta/files/mukta-devanagari-400-normal.woff2', 'mukta-devanagari-400.woff2'],
  ['@fontsource/mukta/files/mukta-devanagari-700-normal.woff2', 'mukta-devanagari-700.woff2'],

  // JetBrains Mono, Latin only, two weights. Numerals-as-data only — helpline numbers,
  // counts, verified-on dates. Its dotted zero reads more clearly than a slashed zero
  // when she is copying 15100 onto her hand.
  ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', 'jetbrains-mono-400.woff2'],
  ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2', 'jetbrains-mono-700.woff2'],
];

mkdirSync('public/fonts', { recursive: true });

let total = 0;
for (const [from, to] of FONTS) {
  const src = `node_modules/${from}`;
  const dest = `public/fonts/${to}`;
  copyFileSync(src, dest);
  const kb = statSync(dest).size / 1024;
  total += kb;
  console.log(`${to.padEnd(32)} ${kb.toFixed(1)} KB`);
}
console.log(`${''.padEnd(32)} ${'─'.repeat(9)}`);
console.log(`${'total font payload'.padEnd(32)} ${total.toFixed(1)} KB`);

// Fonts load with font-display: swap so they never block the first paint (UF-13), and
// each @font-face is fetched only if that weight is actually used on the page — so a
// typical Hindi page pays Montserrat + Mukta 400 + Mukta 700 ≈ 237 KB, once, then it is
// service-worker cached forever. A runaway payload still costs her data she pays for.
if (total > 290) {
  console.warn(`\n⚠ font payload ${total.toFixed(1)} KB is heavier than expected — check the subset list`);
}
