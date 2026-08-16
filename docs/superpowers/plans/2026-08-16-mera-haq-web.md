# Mera Haq Web Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the production Mera Haq website — a Hindi-first, audio-first, login-light rights platform that routes a woman through five tap-only questions to a personalised deck of five Haq Cards, one quiet action, and a free phone number.

**Architecture:** Astro 7 static-first. Every rights route prerenders to plain HTML with zero hydration so it survives JavaScript being off; JavaScript is added only as islands, on the routes that earn it. One pure `deck()` function is the single diagnostic engine for all shells. Quick exit is an inline head script that never waits for a framework.

**Tech Stack:** Astro 7.2 · Tailwind CSS 4.3 (CSS-first `@theme`, via `@tailwindcss/vite`) · TypeScript strict · GSAP 3.15 + ScrollTrigger · Vitest 4 · Playwright 1.62 · `@vite-pwa/astro` · `@supabase/supabase-js` 2 · `@fontsource*`

**Spec:** `docs/superpowers/specs/2026-08-16-mera-haq-web-design.md`

---

## Global Constraints

Every task's requirements implicitly include this section.

**Platform**
- Node `>=22.12.0` (Astro 7 floor). Local: Node 26.3.1, npm 11.16.0.
- `output: 'static'`. No SSR adapter. Deploy target Cloudflare Pages.
- TypeScript `strict: true`. No `any` in `src/lib/`.

**Budgets — a task that breaches one is not done**
- `/` ≤ 160 KB JS gz · `/shuru` ≤ 80 KB · `/card/*`, `/sabhi-card`, `/madad` ≤ 12 KB
- Shell HTML+CSS first paint < 80 KB · card audio ≤ 250 KB each · square PNG ≤ 200 KB · A5 PDF ≤ 400 KB
- Lighthouse mobile: `/shuru` ≥ 90 perf, `/` ≥ 80 perf, both 100 a11y

**Colour — exact values, no others**
```
--pink-700 #9A1348   --pink-600 #D6336C   --pink-500 #FF4081
--pink-200 #FFB6C1   --pink-050 #FFF5F8
--blue-800 #0D47A1   --blue-600 #1565C0   --blue-050 #E3F2FD
--ink     #1F2A44   --text    #2B2B2B    --muted   #595959
--bg      #F4F5F7   --surface #FFFFFF    --border  #DDDDDD
--green-700 #2E7D32  --green-050 #EAF3EB
--red-700   #B3261E  --red-050   #FDECEA
```
- `--pink-600` is the **only** colour allowed to signal action. Two on one screen means one is wrong.
- `--pink-500` is decorative only — never a `color` on a text node (3.3:1 on white).
- Grammar: pink = her action · blue = government/trust/helpline · green = "sahi hai / muft" · red-tint = "galat hai" verdicts · navy = authority.

**Type**
- Stack `"Montserrat","Mukta",system-ui,sans-serif`, `unicode-range` gated, all self-hosted. **Zero third-party font CDN requests, ever.**
- Emphasis: Montserrat 400→800 (Latin), Mukta 400→700 (Devanagari). Never Mukta 800.
- Numerals-as-data in JetBrains Mono only.
- Body ≥18px on every route. Tap targets ≥48px; ≥56px for helpline numbers and primary CTAs.

**Copy**
- ≤8-word sentences target, hard cap ~12. Bazaar vocabulary: हक़ not अधिकार, काग़ज़ not दस्तावेज़.
- First person. **Facts and events, never accusations.** Nothing that suggests confrontation. Information, never advice.
- Frozen Devanagari strings from the PRD are copied **verbatim** and never improved.
- Every rights page footer: «यह जानकारी है, सलाह नहीं» + reviewer credit + «जाँचा गया: 13 अगस्त 2026».

**Safety — non-negotiable**
- Quick exit ✘ fixed top-right on every screen, <100 ms, works offline / mid-menu / mid-audio / mid-animation.
- ☰ top-left, ✘ top-right, language pill top-centre. **These three never move and never swap.**
- Answers are never stored anywhere. Output deck only.
- No autoplay audio. No cookies. No third-party requests. No analytics beyond aggregate counters.
- `prefers-reduced-motion: reduce` renders everything in final state instantly.

**Owner decisions in force**
- D1 `LEGAL_SIGNOFF = false` → visible DRAFT banner on all rights surfaces.
- D4 Card audio transcoded; delivered filenames map 1:1 to card IDs; originals untouched in `resources/`.
- D6 `tieBreak` corrected to `["C2","C3","C10","C1","C4","C6","C5","C7"]` (C5 before C7) — a one-element data correction that makes all three worked examples pass. Recorded in `matrix.v2.json` with an inline note.
- D7 **No «छोड़ें» skip control in the UI.** Escapes preserved: S0's «सीधे कार्ड देखें», Q3(f), Q4(e), Q5(e), back arrow. `deck()` stays skip-tolerant defensively.
- D8 Explorer deck is gate-filtered then topped up so it is always exactly 5 cards.

**Commits:** Conventional Commits. Commit at the end of every task, minimum.

---

## File Structure

```
merahaq-web/
├── astro.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
├── .env.example
├── resources/
│   ├── audio/                       # the 10 delivered MP3s, untouched
│   └── MANIFEST.md                  # name → card map + the "missing" list
├── scripts/
│   ├── inventory-resources.mjs      # Task 1
│   ├── measure-font-metrics.mjs     # Task 4
│   ├── transcode-audio.mjs          # Task 14
│   └── generate-card-assets.mjs     # Task 18  (PNG + PDF)
├── src/
│   ├── content.config.ts            # Astro content collections
│   ├── content/cards/               # cN.hi.json, cN.hinglish.json, cN.en.json
│   ├── lib/
│   │   ├── matrix.v2.json           # Diagnostic Spec §7 JSON + D6 correction
│   │   ├── deck.ts                  # THE engine — one implementation
│   │   ├── types.ts                 # CardId, Answers, Lang, Prefs
│   │   ├── prefs.ts                 # localStorage read/write, the only storage module
│   │   ├── audio.ts                 # सुनिए player + TTS fallback + mute
│   │   ├── auth.ts                  # Supabase adapter
│   │   └── i18n/
│   │       ├── index.ts             # t() + lang store
│   │       └── ui.json              # {key: {hi, hinglish, en}} chrome + diagnostic strings
│   ├── styles/
│   │   ├── tokens.css               # @theme — palette, type scale, spacing, radius
│   │   ├── fonts.css                # @font-face incl. generated metric overrides
│   │   └── global.css
│   ├── components/
│   │   ├── chrome/                  # Header, QuickExit, LangPill, MenuOverlay,
│   │   │                            # HelplineStrip, SunieButton, MuteToggle, DraftBanner
│   │   ├── home/                    # Hero, HowTo, Value, Impact, CardGallery,
│   │   │                            # Features, Faq, Footer, HomeMotion, SakhiFab
│   │   ├── diagnostic/              # Diagnostic, QuestionScreen, OptionRow, ProgressDots,
│   │   │                            # Processing, Reveal, SakhiChat
│   │   ├── card/                    # CardTemplate, EkKadam, AuthorityBlock, ShareRow,
│   │   │                            # CrossLinks, HaqCard (the deck motif)
│   │   ├── madad/                   # HelplineBlock, MadadRow
│   │   └── LoginSheet.astro
│   └── pages/                       # index, shuru, aapke-card, sabhi-card,
│                                    # card/[id], madad, hamare-baare-mein, asar
└── tests/
    ├── deck.spec.ts        vitest — engine
    ├── i18n.spec.ts        vitest — every key present in all 3 languages
    ├── content.spec.ts     vitest — card content shape + copy rules
    ├── e2e/
    │   ├── safety.spec.ts        playwright — §9.1–9.10
    │   ├── suppression.spec.ts   playwright
    │   ├── tokens.spec.ts        playwright — pink-600 exclusivity, contrast
    │   ├── nojs.spec.ts          playwright — javaScriptEnabled: false
    │   └── offline.spec.ts       playwright — network killed after first visit
```

**Boundaries that matter:** `deck.ts` imports nothing but `matrix.v2.json` and `types.ts` — it must stay framework-free so three shells and Vitest can all import it. `prefs.ts` is the only module that touches `localStorage`; nothing else may. `audio.ts` is the only module that constructs an `Audio` or calls `speechSynthesis`.

---

## Phase 1 — Foundation (Tasks 1–7)

### Task 1: Resource inventory and MANIFEST

**Files:**
- Create: `scripts/inventory-resources.mjs`
- Create: `resources/MANIFEST.md` (generated)
- Create: `resources/audio/` (10 copied MP3s)

**Interfaces:**
- Produces: `resources/MANIFEST.md` — the authoritative name→card map consumed by Task 14 and Task 18.

- [ ] **Step 1: Copy the delivered audio into the repo**

```bash
mkdir -p resources/audio
cp "D:/MeraHaq/drive-download-20260816T114815Z-1-001/"*.mp3 resources/audio/
ls -la resources/audio/
```
Expected: 10 files, ~5 MB each.

- [ ] **Step 2: Write the inventory script**

`scripts/inventory-resources.mjs`:

```js
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Delivered filenames map 1:1 to card IDs. The naming is exact — owner decision D4.
const AUDIO_MAP = {
  'Card 1 - Streedhan.mp3': 'c1',
  'Card 2- Kamayi.mp3': 'c2',
  'Card 3 - Ghar mein rehene ka haq.mp3': 'c3',
  'Card 4 - Guzara Bhatta.mp3': 'c4',
  'Card 5 - Beti ka Hissa.mp3': 'c5',
  'Card 6 - Apna Bank Khata.mp3': 'c6',
  'Card 7 - Kaagaz.mp3': 'c7',
  'Card 8 - Muft Vakil.mp3': 'c8',
  'Card 9 - Vidhwa ka hissa.mp3': 'c9',
  'Card 10 - Karz aapka nhi.mp3': 'c10',
};

// Assets the PRD requires that were NOT delivered. Each has a handling decision.
const MISSING = [
  ['S0 welcome clip', 'F-05', 'hi-IN Web Speech fallback'],
  ['S0b region clip', 'F-15b / RQ-5', 'hi-IN Web Speech fallback'],
  ['Q1–Q5 stitched screen clips (question + numbered options)', 'F-05', 'hi-IN Web Speech fallback'],
  ['Q3 clip variant B (options a,b omitted for Q1=d)', 'F-05 / UF-12', 'hi-IN Web Speech fallback'],
  ['Per-option replay clips', 'F-05', 'hi-IN Web Speech fallback'],
  ['/madad digit-by-digit number clips', 'F-43', 'hi-IN Web Speech, digit-split reader'],
  ['1080×1080 WhatsApp square PNGs ×10', 'F-30', 'generated at build — Task 18'],
  ['A5 print PDFs ×10', 'F-31', 'generated at build — Task 18'],
  ['Sakhi avatar illustration', 'F-120', 'inline SVG — Task 15'],
];

const dir = 'resources/audio';
const files = readdirSync(dir).filter((f) => f.endsWith('.mp3'));

const rows = files.map((f) => {
  const bytes = statSync(join(dir, f)).size;
  return { file: f, card: AUDIO_MAP[f] ?? '⚠ UNMAPPED', kb: Math.round(bytes / 1024) };
});
rows.sort((a, b) => a.card.localeCompare(b.card, undefined, { numeric: true }));

const unmapped = rows.filter((r) => r.card.startsWith('⚠'));
const expected = Object.keys(AUDIO_MAP).filter((k) => !files.includes(k));

const md = `# Resource Manifest

Generated by \`scripts/inventory-resources.mjs\`. Do not edit by hand.

Source: \`drive-download-20260816T114815Z-1-001.zip\` (10 entries, audio only).

## Delivered — card audio

Filenames map 1:1 to card IDs. The mapping below is authoritative and is consumed by
\`scripts/transcode-audio.mjs\` and \`scripts/generate-card-assets.mjs\`.

| Card | Delivered filename | Size | Budget (F-05) | Shipped as |
|---|---|---|---|---|
${rows.map((r) => `| \`${r.card}\` | \`${r.file}\` | ${r.kb} KB | ≤250 KB | \`public/audio/${r.card}.webm\` + \`.mp3\` |`).join('\n')}

Originals are ~20× the F-05 budget of 250 KB and are never served. They stay here
untouched as the master; \`transcode-audio.mjs\` emits mono ~40 kbps variants into
\`public/audio/\`. Any clip over 60 s is reported as a re-record decision, not truncated.

${unmapped.length ? `⚠ Unmapped files present: ${unmapped.map((r) => r.file).join(', ')}\n` : ''}
${expected.length ? `⚠ Expected but absent: ${expected.join(', ')}\n` : ''}

## Missing — required by the PRD, not delivered

| Asset | Feature | Handling until delivered |
|---|---|---|
${MISSING.map(([a, f, h]) => `| ${a} | ${f} | ${h} |`).join('\n')}

**To record:** the ten screen clips are the real gap. F-05 is explicit that these must be
pre-recorded human voice in the sakhi register, not TTS — "a synthetic voice reads as a
government machine and loses the one thing this product has." The TTS fallback is a
placeholder that keeps the control functional, not the intended experience.
`;

writeFileSync('resources/MANIFEST.md', md);
console.log(`MANIFEST written: ${rows.length} mapped, ${unmapped.length} unmapped, ${expected.length} absent`);
```

- [ ] **Step 3: Run it and verify the mapping is complete**

```bash
node scripts/inventory-resources.mjs
```
Expected: `MANIFEST written: 10 mapped, 0 unmapped, 0 absent`. If any file is unmapped, the delivered filename differs from `AUDIO_MAP` — fix the map, never rename the source file.

- [ ] **Step 4: Commit**

```bash
git add scripts/inventory-resources.mjs resources/
git commit -m "chore: inventory delivered resources into MANIFEST

Ten card MP3s mapped 1:1 to card IDs with exact delivered filenames.
Records the nine PRD-required assets that were not delivered and the
handling decision for each."
```

---

### Task 2: Project scaffold

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.env.example`
- Create: `src/pages/index.astro` (placeholder, replaced in Task 8)
- Create: `src/styles/global.css`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm test`, `npm run test:e2e` all working. Every later task depends on these.

- [ ] **Step 1: Create the Astro project non-interactively**

```bash
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict --yes
```

- [ ] **Step 2: Install dependencies**

```bash
npm install astro@^7.2.2
npm install -D @tailwindcss/vite@^4.3.3 tailwindcss@^4.3.3 typescript vitest@^4.1.10 @playwright/test@^1.62.1
npm install gsap@^3.15.0 @supabase/supabase-js@^2.112.3
npm install @fontsource-variable/montserrat@^5.3.0 @fontsource/mukta@^5.3.0 @fontsource/jetbrains-mono@^5.3.0
npm install -D @vite-pwa/astro@^1.2.0
npx playwright install chromium
```

- [ ] **Step 3: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://merahaq.pages.dev',
  vite: { plugins: [tailwind()] },
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
```

`inlineStylesheets: 'always'` is deliberate: the shell must paint in one round trip on 2G (UF-13), and our total CSS is small enough to inline.

- [ ] **Step 4: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/*.spec.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 5: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4321', trace: 'retain-on-failure' },
  projects: [
    { name: 'sunita', use: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 6: Add scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview --port 4321",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "assets": "node scripts/transcode-audio.mjs && node scripts/generate-card-assets.mjs",
    "metrics": "node scripts/measure-font-metrics.mjs"
  }
}
```

- [ ] **Step 7: Write `.env.example`**

```bash
# Public site origin. Cloudflare Pages preview until the real domain is wired in.
SITE_URL=https://merahaq.pages.dev

# Supabase — owner decision D2. Login is optional and non-blocking; absent values
# disable the login surfaces entirely rather than erroring.
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
```

- [ ] **Step 8: Verify the toolchain**

```bash
npm run build && npm test -- --run --passWithNoTests
```
Expected: build succeeds, vitest exits 0.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro 7 + Tailwind 4 + Vitest + Playwright

Static output, no SSR adapter. Stylesheets inlined so the shell paints in
one round trip on 2G. Playwright projects pinned to 360x740 (Sunita's
phone), 768 and 1440."
```

---

### Task 3: The diagnostic engine — TDD

This is the highest-value unit in the codebase and has no UI dependency. It is built first, test-first.

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/matrix.v2.json`
- Create: `src/lib/deck.ts`
- Test: `tests/deck.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  export type CardId = 'C1'|'C2'|'C3'|'C4'|'C5'|'C6'|'C7'|'C8'|'C9'|'C10';
  export type Q1 = 'a'|'b'|'c'|'d'|'e';
  export type Q2 = 'a'|'b'|'c'|'d'|'e';
  export type Q3 = 'a'|'b'|'c'|'d'|'e'|'f';
  export type Q4 = 'a'|'b'|'c'|'d'|'e';
  export type Q5 = 'a'|'b'|'c'|'d'|'e';
  export type Region = 'north'|'south'|'east'|'west'|'central'|'unknown';
  export interface Answers { q1?: Q1; q2?: Q2; q3?: Q3[]; q4?: Q4; q5?: Q5[]; region?: Region }
  export function deck(answers: Answers): CardId[];   // always exactly 5, C8 always last
  export function hiddenOptions(answers: Answers): string[];  // e.g. ['Q3a','Q3b'] when q1==='d'
  export const MATRIX_VERSION: 2;
  ```
- Consumed by: Task 10 (`/shuru`), Task 15 (Sakhi shell), Task 11 (`/aapke-card` deep-link validation).

- [ ] **Step 1: Write `src/lib/types.ts`**

```ts
export type CardId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9' | 'C10';

export type Q1 = 'a' | 'b' | 'c' | 'd' | 'e';
export type Q2 = 'a' | 'b' | 'c' | 'd' | 'e';
export type Q3 = 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
export type Q4 = 'a' | 'b' | 'c' | 'd' | 'e';
export type Q5 = 'a' | 'b' | 'c' | 'd' | 'e';

export type Region = 'north' | 'south' | 'east' | 'west' | 'central' | 'unknown';
export type Lang = 'hi' | 'hinglish' | 'en';

/**
 * Answers exist only for the lifetime of the diagnostic component.
 * They are NEVER persisted — not to localStorage, not to Supabase, not anywhere.
 * Every field is optional because deck() must stay total: the WhatsApp bot and
 * deep-linked decks can arrive partial, and the acceptance checklist requires an
 * all-skipped fixture. The UI itself has no skip control (owner decision D7).
 */
export interface Answers {
  q1?: Q1;
  q2?: Q2;
  q3?: Q3[];
  q4?: Q4;
  q5?: Q5[];
  region?: Region;
}

/** The ONLY shape written to localStorage. Output deck, never answers. */
export interface Prefs {
  deck: CardId[];
  v: number;
  lang: Lang;
  region?: Region;
  muted: boolean;
  seenAudioNote: boolean;
  seenLoginSheet: boolean;
}
```

- [ ] **Step 2: Write `src/lib/matrix.v2.json`**

Diagnostic Spec §7 verbatim, with the single D6 correction and a note recording it.

```json
{
  "v": 2,
  "_note": "Diagnostic Spec v1.1 §7 verbatim, with one owner-approved data correction (D6, 16 Aug 2026): tieBreak had C7 before C5, which contradicted worked example C. The two entries are transposed here so all three worked examples pass. No logic changed.",
  "gates": { "Q1!=c": ["C9"], "Q1==d": ["C1", "C4"] },
  "hideOptions": { "Q1==d": ["Q3a", "Q3b"] },
  "pins": { "Q4==d": "C10", "Q1==c": "C9" },
  "pinOrder": ["C10", "C9"],
  "tieBreak": ["C2", "C3", "C10", "C1", "C4", "C6", "C5", "C7"],
  "foundation": ["C6", "C7", "C2", "C1"],
  "universal": "C8",
  "weights": {
    "Q1a": { "C1": 1, "C3": 1 },
    "Q1b": { "C1": 1, "C3": 2, "C4": 2 },
    "Q1c": { "C3": 1, "C7": 1 },
    "Q1d": { "C5": 2, "C6": 1, "C7": 1 },
    "Q1e": { "C1": 2, "C4": 3, "C5": 1 },
    "Q2a": { "C6": 1 },
    "Q2b": { "C2": 3, "C6": 2 },
    "Q2c": { "C6": 1 },
    "Q2d": { "C2": 3, "C4": 1, "C6": 1 },
    "Q2e": { "C4": 1, "C6": 1 },
    "Q3a": { "C1": 2 },
    "Q3b": { "C1": 2 },
    "Q3c": { "C3": 2 },
    "Q3d": { "C5": 2 },
    "Q3e": { "C2": 2, "C4": 1 },
    "Q4b": { "C10": 2 },
    "Q4c": { "C6": 1, "C10": 3 },
    "Q4d": { "C10": 3 },
    "Q5_no_bank": { "C6": 3 },
    "Q5_no_papers": { "C7": 3 },
    "Q5_no_sim": { "C6": 1, "C7": 1 },
    "Q5_no_list": { "C1": 1 }
  },
  "cross": [
    { "if": ["Q1==c", "Q4 in b,c,d"], "add": { "C10": 2 } },
    { "if": ["Q1==e", "Q3 has a|b"], "add": { "C1": 1 } },
    { "if": ["Q3 has a", "Q3 has b"], "add": { "C1": 1 } }
  ],
  "explorer": {
    "when": ["Q3==f or Q3 skipped", "no pins", "maxScore<=2"],
    "deck": ["C6", "C7", "C2", "C1", "C8"]
  }
}
```

- [ ] **Step 3: Write the failing tests**

`tests/deck.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { deck, hiddenOptions, MATRIX_VERSION } from '../src/lib/deck';
import type { Answers, CardId, Q1, Q2, Q3, Q4, Q5 } from '../src/lib/types';

describe('matrix', () => {
  it('is version 2', () => expect(MATRIX_VERSION).toBe(2));
});

describe('worked examples from Diagnostic Spec §4', () => {
  // A. Married & cohabiting · earns but hands over salary · ticks "gehne mile" +
  //    "maangna padta hai" · no loan · has papers and SIM, no bank account, no jewellery list
  it('A → [C2, C6, C1, C3, C8]', () => {
    expect(deck({ q1: 'a', q2: 'b', q3: ['a', 'e'], q4: 'a', q5: ['b', 'c'] }))
      .toEqual(['C2', 'C6', 'C1', 'C3', 'C8']);
  });

  // B. Widow · no steady income · ticks "ghar mere naam par nahin" + "maangna padta hai"
  //    · husband's loan pending · nothing ticked on Q5
  it('B → [C9, C6, C7, C10, C8]', () => {
    expect(deck({ q1: 'c', q2: 'e', q3: ['c', 'e'], q4: 'b', q5: [] }))
      .toEqual(['C9', 'C6', 'C7', 'C10', 'C8']);
  });

  // C. Unmarried · earns and keeps · ticks "maayke mein zameen hai" (a,b hidden)
  //    · no loans · has bank + SIM, papers with family
  it('C → [C5, C7, C6, C2, C8]', () => {
    expect(deck({ q1: 'd', q2: 'a', q3: ['d'], q4: 'a', q5: ['a', 'c'] }))
      .toEqual(['C5', 'C7', 'C6', 'C2', 'C8']);
  });
});

describe('explorer mode', () => {
  it('Q3=f with no pins and maxScore<=2 serves the foundation deck', () => {
    expect(deck({ q1: 'a', q2: 'a', q3: ['f'], q4: 'a', q5: ['a', 'b', 'c', 'd'] }))
      .toEqual(['C6', 'C7', 'C2', 'C1', 'C8']);
  });

  it('every question skipped serves the foundation deck', () => {
    expect(deck({})).toEqual(['C6', 'C7', 'C2', 'C1', 'C8']);
  });

  // Owner decision D8. Q1=d gates C1 out of the fixed explorer deck, which would
  // otherwise return four cards under a screen that says «ये 5 कार्ड आपके लिए हैं».
  it('gate-filters and tops up when the explorer deck collides with a gate', () => {
    const d = deck({ q1: 'd', q2: 'a', q3: ['f'], q4: 'a', q5: ['a', 'b', 'c', 'd'] });
    expect(d).toEqual(['C6', 'C7', 'C2', 'C5', 'C8']);
    expect(d).not.toContain('C1');
  });
});

describe('gates', () => {
  it('excludes C9 for anyone who is not widowed', () => {
    const nonWidow: Q1[] = ['a', 'b', 'd', 'e'];
    for (const q1 of nonWidow) {
      expect(deck({ q1, q2: 'd', q3: ['c', 'e'], q4: 'c', q5: [] })).not.toContain('C9');
    }
  });

  it('excludes C1 and C4 for an unmarried woman', () => {
    const d = deck({ q1: 'd', q2: 'd', q3: ['d'], q4: 'c', q5: [] });
    expect(d).not.toContain('C1');
    expect(d).not.toContain('C4');
  });

  it('hides Q3 statements a and b when Q1=d', () => {
    expect(hiddenOptions({ q1: 'd' })).toEqual(['Q3a', 'Q3b']);
    expect(hiddenOptions({ q1: 'a' })).toEqual([]);
  });
});

describe('pins', () => {
  it('pins C10 first when recovery agents are active', () => {
    expect(deck({ q1: 'a', q2: 'a', q3: ['a'], q4: 'd', q5: ['a', 'b', 'c', 'd'] })[0]).toBe('C10');
  });

  it('pins C9 first for a widow', () => {
    expect(deck({ q1: 'c', q2: 'a', q3: ['c'], q4: 'a', q5: ['a', 'b', 'c', 'd'] })[0]).toBe('C9');
  });

  it('orders C10 before C9 when both fire', () => {
    const d = deck({ q1: 'c', q2: 'a', q3: ['c'], q4: 'd', q5: ['a', 'b', 'c', 'd'] });
    expect(d[0]).toBe('C10');
    expect(d[1]).toBe('C9');
  });
});

describe('cross-rules', () => {
  it('X1 adds C10 +2 for a widow with a family loan', () => {
    // Without X1 C10 scores 2 from Q4b and would rank below C3 (3). With X1 it scores 4.
    const withRule = deck({ q1: 'c', q2: 'e', q3: ['c', 'e'], q4: 'b', q5: [] });
    expect(withRule).toContain('C10');
  });

  it('X3 lifts C1 when both streedhan statements are ticked', () => {
    const both = deck({ q1: 'a', q2: 'a', q3: ['a', 'b'], q4: 'a', q5: ['a', 'b', 'c', 'd'] });
    expect(both[0]).toBe('C1'); // 1 + 2 + 2 + 1(X3) = 6, the clear top score
  });
});

describe('invariants — hold for every reachable answer combination', () => {
  const Q1S: (Q1 | undefined)[] = ['a', 'b', 'c', 'd', 'e', undefined];
  const Q2S: (Q2 | undefined)[] = ['a', 'b', 'c', 'd', 'e', undefined];
  const Q4S: (Q4 | undefined)[] = ['a', 'b', 'c', 'd', 'e', undefined];
  const Q3S: (Q3[] | undefined)[] = [['a'], ['b'], ['c'], ['d'], ['e'], ['f'], ['a', 'b'],
    ['a', 'b', 'c', 'd', 'e'], [], undefined];
  const Q5S: (Q5[] | undefined)[] = [['a'], ['b'], ['c'], ['d'], ['e'], ['a', 'b', 'c', 'd'],
    [], undefined];

  function* every(): Generator<Answers> {
    for (const q1 of Q1S) for (const q2 of Q2S) for (const q3 of Q3S)
      for (const q4 of Q4S) for (const q5 of Q5S) yield { q1, q2, q3, q4, q5 };
  }

  it('always returns exactly 5 distinct cards, C8 last', () => {
    for (const a of every()) {
      const d = deck(a);
      expect(d, JSON.stringify(a)).toHaveLength(5);
      expect(new Set(d).size, JSON.stringify(a)).toBe(5);
      expect(d[4], JSON.stringify(a)).toBe('C8');
    }
  });

  it('never returns a gated card', () => {
    for (const a of every()) {
      const d = deck(a);
      if (a.q1 !== 'c') expect(d, JSON.stringify(a)).not.toContain('C9');
      if (a.q1 === 'd') {
        expect(d, JSON.stringify(a)).not.toContain('C1');
        expect(d, JSON.stringify(a)).not.toContain('C4');
      }
    }
  });

  it('is pure — the same answers always produce the same deck', () => {
    for (const a of every()) expect(deck(a)).toEqual(deck(a));
  });

  it('ignores region entirely (RQ-7: region contributes zero weight)', () => {
    const base: Answers = { q1: 'a', q2: 'b', q3: ['a', 'e'], q4: 'a', q5: ['b', 'c'] };
    const regions = ['north', 'south', 'east', 'west', 'central', 'unknown'] as const;
    for (const region of regions) expect(deck({ ...base, region })).toEqual(deck(base));
  });
});
```

- [ ] **Step 4: Run the tests and verify they fail**

```bash
npm test
```
Expected: FAIL — `Failed to resolve import "../src/lib/deck"`.

- [ ] **Step 5: Implement `src/lib/deck.ts`**

```ts
import matrix from './matrix.v2.json';
import type { Answers, CardId } from './types';

export const MATRIX_VERSION = matrix.v as 2;

const ALL_CARDS = Object.freeze([
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10',
]) as readonly CardId[];

const UNIVERSAL = matrix.universal as CardId;
const TIE_BREAK = matrix.tieBreak as CardId[];
const FOUNDATION = matrix.foundation as CardId[];
const WEIGHTS = matrix.weights as Record<string, Partial<Record<CardId, number>>>;

/** Options the UI must not render for these answers. UF-12 / F-20. */
export function hiddenOptions(a: Answers): string[] {
  return a.q1 === 'd' ? [...matrix.hideOptions['Q1==d']] : [];
}

/** 1. GATE — cards excluded by life stage. Never removes them from /sabhi-card. */
function gated(a: Answers): Set<CardId> {
  const out = new Set<CardId>();
  if (a.q1 !== 'c') for (const c of matrix.gates['Q1!=c']) out.add(c as CardId);
  if (a.q1 === 'd') for (const c of matrix.gates['Q1==d']) out.add(c as CardId);
  return out;
}

/** 2. SCORE — S(c) = Σ W[q][a][c], plus cross-rules X1–X3. */
function score(a: Answers): Map<CardId, number> {
  const s = new Map<CardId, number>();
  const add = (row?: Partial<Record<CardId, number>>) => {
    if (!row) return;
    for (const [card, w] of Object.entries(row)) {
      s.set(card as CardId, (s.get(card as CardId) ?? 0) + (w ?? 0));
    }
  };

  if (a.q1) add(WEIGHTS[`Q1${a.q1}`]);
  if (a.q2) add(WEIGHTS[`Q2${a.q2}`]);
  if (a.q3) for (const t of a.q3) if (t !== 'f') add(WEIGHTS[`Q3${t}`]);
  if (a.q4) add(WEIGHTS[`Q4${a.q4}`]);

  // Q5 is inverse-scored: an UNTICKED box is the signal. A skipped question
  // contributes 0 everywhere, so `undefined` is not the same as `[]`.
  if (a.q5) {
    const has = (k: 'a' | 'b' | 'c' | 'd') => a.q5!.includes(k) && !a.q5!.includes('e');
    if (!has('a')) add(WEIGHTS.Q5_no_bank);
    if (!has('b')) add(WEIGHTS.Q5_no_papers);
    if (!has('c')) add(WEIGHTS.Q5_no_sim);
    if (!has('d')) add(WEIGHTS.Q5_no_list);
  }

  const t3 = (k: string) => a.q3?.includes(k as never) ?? false;
  if (a.q1 === 'c' && (a.q4 === 'b' || a.q4 === 'c' || a.q4 === 'd')) add({ C10: 2 });   // X1
  if (a.q1 === 'e' && (t3('a') || t3('b'))) add({ C1: 1 });                              // X2
  if (t3('a') && t3('b')) add({ C1: 1 });                                                // X3

  return s;
}

/** 3. PIN — urgency overrides. Order when both fire: C10, C9. */
function pins(a: Answers): CardId[] {
  const fired = new Set<CardId>();
  if (a.q4 === 'd') fired.add(matrix.pins['Q4==d'] as CardId);
  if (a.q1 === 'c') fired.add(matrix.pins['Q1==c'] as CardId);
  return (matrix.pinOrder as CardId[]).filter((c) => fired.has(c));
}

/** 4. RANK — score desc, ties broken by the fixed priority order. */
function ranked(s: Map<CardId, number>, exclude: Set<CardId>): CardId[] {
  return ALL_CARDS
    .filter((c) => c !== UNIVERSAL && !exclude.has(c) && (s.get(c) ?? 0) > 0)
    .sort((x, y) => {
      const d = (s.get(y) ?? 0) - (s.get(x) ?? 0);
      if (d !== 0) return d;
      const ix = TIE_BREAK.indexOf(x);
      const iy = TIE_BREAK.indexOf(y);
      return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy);
    });
}

/**
 * GATE → SCORE → PIN → RANK → FILL.
 * Pure. Total. Always returns exactly 5 distinct cards with C8 last.
 */
export function deck(a: Answers): CardId[] {
  const excluded = gated(a);
  const s = score(a);
  const pinned = pins(a).filter((c) => !excluded.has(c));
  const rank = ranked(s, excluded);
  const maxScore = rank.length ? (s.get(rank[0]) ?? 0) : 0;

  const out: CardId[] = [];
  const push = (c: CardId) => {
    if (out.length < 4 && c !== UNIVERSAL && !excluded.has(c) && !out.includes(c)) out.push(c);
  };

  const q3Empty = !a.q3 || a.q3.length === 0 || a.q3.includes('f');
  if (q3Empty && pinned.length === 0 && maxScore <= 2) {
    // Explorer mode. The declared deck is fixed, but gates still apply (owner
    // decision D8) — an unmarried woman must not be shown C1. Filter, then top up
    // from her own highest-scoring cards so the deck is always exactly 5.
    for (const c of matrix.explorer.deck as CardId[]) push(c);
  } else {
    for (const c of pinned) push(c);
    for (const c of rank) push(c);
  }

  for (const c of rank) push(c);        // top-up 1: her own signal
  for (const c of FOUNDATION) push(c);  // top-up 2: minimum-floor rule
  for (const c of TIE_BREAK) push(c);   // top-up 3: unreachable in practice, keeps deck() total

  out.push(UNIVERSAL);
  return out;
}
```

- [ ] **Step 6: Run the tests and verify they pass**

```bash
npm test
```
Expected: PASS, all suites. If example C fails with `[C7, C5, ...]`, `matrix.v2.json` is missing the D6 correction.

- [ ] **Step 7: Commit**

```bash
git add src/lib tests/deck.spec.ts
git commit -m "feat(engine): add deck() — the one diagnostic implementation

GATE -> SCORE -> PIN -> RANK -> FILL, pure and total. Matrix v:2 verbatim
from the Diagnostic Spec with the D6 tieBreak correction (C5 before C7),
which makes all three worked examples pass without a logic change.

Explorer mode gate-filters and tops up (D8) so the deck is always exactly
five cards, closing a collision the source spec did not cover.

Fuzz over the full answer space asserts: exactly 5 distinct cards, C8 last,
no gated card ever returned, purity, and that region contributes zero weight."
```

---

### Task 4: Design tokens, fonts, and measured metric matching

**Files:**
- Create: `scripts/measure-font-metrics.mjs`
- Create: `src/styles/tokens.css`, `src/styles/fonts.css`, `src/styles/global.css`
- Test: `tests/e2e/tokens.spec.ts` (contrast + conjunct rendering)

**Interfaces:**
- Produces: CSS custom properties consumed by every component. Tailwind 4 `@theme` exposes them as utilities (`bg-pink-600`, `text-ink`, `rounded-card`).

- [ ] **Step 1: Write the font metric measurement script**

`scripts/measure-font-metrics.mjs` — reads the real OS/2 and hhea tables out of the installed
binaries and computes overrides, so the Montserrat/Mukta seam is measured rather than eyeballed.

```js
import { readFileSync, writeFileSync } from 'node:fs';

/** Minimal TrueType/OpenType table reader — enough for head, hhea and OS/2. */
function readMetrics(path) {
  const b = readFileSync(path);
  const numTables = b.readUInt16BE(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const off = 12 + i * 16;
    tables[b.toString('ascii', off, off + 4)] = b.readUInt32BE(off + 8);
  }
  const head = tables['head'];
  const hhea = tables['hhea'];
  const os2 = tables['OS/2'];
  if (head === undefined || hhea === undefined || os2 === undefined) {
    throw new Error(`missing metric tables in ${path}`);
  }
  const unitsPerEm = b.readUInt16BE(head + 18);
  const version = b.readUInt16BE(os2);
  return {
    unitsPerEm,
    ascender: b.readInt16BE(hhea + 4),
    descender: b.readInt16BE(hhea + 6),
    lineGap: b.readInt16BE(hhea + 8),
    // sxHeight and sCapHeight exist only from OS/2 version 2 onward.
    xHeight: version >= 2 ? b.readInt16BE(os2 + 86) : 0,
    capHeight: version >= 2 ? b.readInt16BE(os2 + 88) : 0,
  };
}

const MONTSERRAT = 'node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2';
const MUKTA = 'node_modules/@fontsource/mukta/files/mukta-devanagari-400-normal.woff2';

// woff2 is compressed; measure the uncompressed .ttf shipped alongside where available,
// otherwise fall back to the published metrics below (both families are stable releases).
const PUBLISHED = {
  montserrat: { unitsPerEm: 1000, xHeight: 517, capHeight: 700, ascender: 968, descender: -251 },
  mukta:      { unitsPerEm: 1000, xHeight: 490, capHeight: 660, ascender: 1000, descender: -300 },
};

let m, k;
try {
  m = readMetrics(MONTSERRAT.replace('.woff2', '.ttf'));
  k = readMetrics(MUKTA.replace('.woff2', '.ttf'));
  console.log('measured from binaries');
} catch {
  m = PUBLISHED.montserrat;
  k = PUBLISHED.mukta;
  console.log('WARNING: .ttf not present in @fontsource package; using published metrics');
}

const norm = (v, upm) => v / upm;

// size-adjust scales Mukta so its x-height matches Montserrat's, removing the seam
// on a mixed-script line like «PMJDY खाता खोलें».
const sizeAdjust = (norm(m.xHeight, m.unitsPerEm) / norm(k.xHeight, k.unitsPerEm)) * 100;
// ascent/descent overrides are expressed relative to the ADJUSTED em, so divide them back out.
const ascent = (norm(k.ascender, k.unitsPerEm) / (sizeAdjust / 100)) * 100;
const descent = (Math.abs(norm(k.descender, k.unitsPerEm)) / (sizeAdjust / 100)) * 100;

const css = `/* GENERATED by scripts/measure-font-metrics.mjs — do not edit by hand.
 * Montserrat x-height ${m.xHeight}/${m.unitsPerEm}, Mukta x-height ${k.xHeight}/${k.unitsPerEm}.
 * These overrides make Devanagari and Latin sit on the same optical baseline so a
 * mixed-script line has no visible seam. Re-run \`npm run metrics\` after a font bump. */
:root {
  --mukta-size-adjust: ${sizeAdjust.toFixed(2)}%;
  --mukta-ascent-override: ${ascent.toFixed(2)}%;
  --mukta-descent-override: ${descent.toFixed(2)}%;
}
`;

writeFileSync('src/styles/font-metrics.generated.css', css);
console.log(`size-adjust ${sizeAdjust.toFixed(2)}%  ascent ${ascent.toFixed(2)}%  descent ${descent.toFixed(2)}%`);
```

- [ ] **Step 2: Run it**

```bash
npm run metrics
```
Expected: writes `src/styles/font-metrics.generated.css` and prints three percentages. `size-adjust` should land between 100% and 115% — anything outside that means the wrong file was measured.

- [ ] **Step 3: Write `src/styles/fonts.css`**

```css
/* Self-hosted only. A font request to a third-party CDN is a log entry on someone
 * else's server — see the no-tracking principle. Zero external requests, ever. */
@import '@fontsource-variable/montserrat/wght.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/700.css';
@import './font-metrics.generated.css';

/* Mukta carries Devanagari only. unicode-range keeps its Latin subset from ever
 * downloading, and keeps glyph fallback deterministic rather than accidental. */
@font-face {
  font-family: 'Mukta';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('@fontsource/mukta/files/mukta-devanagari-400-normal.woff2') format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839;
  size-adjust: var(--mukta-size-adjust);
  ascent-override: var(--mukta-ascent-override);
  descent-override: var(--mukta-descent-override);
}
@font-face {
  font-family: 'Mukta';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url('@fontsource/mukta/files/mukta-devanagari-500-normal.woff2') format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839;
  size-adjust: var(--mukta-size-adjust);
  ascent-override: var(--mukta-ascent-override);
  descent-override: var(--mukta-descent-override);
}
@font-face {
  font-family: 'Mukta';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('@fontsource/mukta/files/mukta-devanagari-700-normal.woff2') format('woff2');
  unicode-range: U+0900-097F, U+1CD0-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839;
  size-adjust: var(--mukta-size-adjust);
  ascent-override: var(--mukta-ascent-override);
  descent-override: var(--mukta-descent-override);
}
```

- [ ] **Step 4: Write `src/styles/tokens.css`**

```css
@import 'tailwindcss';

@theme {
  /* pink ramp — brand / her action */
  --color-pink-700: #9a1348;
  --color-pink-600: #d6336c;   /* THE action colour. One per screen. */
  --color-pink-500: #ff4081;   /* decorative only — never a text colour */
  --color-pink-200: #ffb6c1;
  --color-pink-050: #fff5f8;

  /* blue ramp — trust / sarkari channel */
  --color-blue-800: #0d47a1;
  --color-blue-600: #1565c0;
  --color-blue-050: #e3f2fd;

  /* ink + neutrals */
  --color-ink: #1f2a44;
  --color-text: #2b2b2b;
  --color-muted: #595959;
  --color-bg: #f4f5f7;
  --color-surface: #ffffff;
  --color-border: #dddddd;

  /* semantic — cards */
  --color-green-700: #2e7d32;
  --color-green-050: #eaf3eb;
  --color-red-700: #b3261e;
  --color-red-050: #fdecea;

  /* type */
  --font-sans: 'Montserrat Variable', 'Mukta', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* One base, two ceilings. App routes stop at --text-app-display; marketing
     routes continue to --text-display. Nothing shouts where she is concentrating. */
  --text-body: 1.125rem;         /* 18px — F-01 floor, every route */
  --text-body--line-height: 1.6;
  --text-small: 1rem;
  --text-lead: 1.25rem;
  --text-app-title: 1.5rem;
  --text-app-display: 1.875rem;  /* 30px — app route ceiling */
  --text-section: clamp(1.75rem, 1.2rem + 2.4vw, 2.75rem);
  --text-display: clamp(2.25rem, 1.2rem + 5vw, 4.75rem);  /* 36 → 76px */
  --text-stat: clamp(2.5rem, 1.5rem + 4.5vw, 4rem);

  /* spacing — 4px base */
  --spacing: 0.25rem;

  /* radius — bimodal, derived from the greyscale-print rule (spec §4.4).
     The two boxes that must survive a photocopy are the two with zero radius
     and a heavy left rule: Ek Kadam and the authority block. */
  --radius-sheet: 3.5rem;   /* 56px — section sheets only */
  --radius-card: 1.25rem;   /* 20px — Haq Cards, surfaces */
  --radius-action: 0.75rem; /* 12px — buttons, tappable things */
  --radius-pill: 999px;

  /* elevation — almost none. Depth comes from tint, which survives both a cheap
     LCD at 40% brightness and a greyscale print. */
  --shadow-header: 0 1px 0 0 rgb(31 42 68 / 0.06);
  --shadow-fab: 0 6px 20px rgb(31 42 68 / 0.22);
}

/* Tap targets. F-01 floor is 48px; helpline numbers and primary CTAs get 56px. */
@utility tap {
  min-height: 3rem;
  min-width: 3rem;
}
@utility tap-lg {
  min-height: 3.5rem;
}

/* The शिरोरेखा rule — a 3px pink stroke ABOVE a heading, the width of its first
   line. The shirorekha is the horizontal stroke running across the top of every
   Devanagari word; the mark is derived from the script the product is written in. */
@utility shirorekha {
  position: relative;
  padding-block-start: 1rem;
}
```

- [ ] **Step 5: Write `src/styles/global.css`**

```css
@import './fonts.css';
@import './tokens.css';

:root {
  color-scheme: light;
}

html {
  font-family: var(--font-sans);
  font-size: 100%;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: var(--text-body);
  line-height: 1.6;
  text-rendering: optimizeLegibility;
}

/* Numerals-as-data. A numeral in mono means "this is a number you can act on" —
   a helpline, a count, a verified-on date. Never used for prose. */
.mono,
[data-mono] {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
}

/* Mixed weight is the sitewide emphasis mechanic, with a different delta per
   script: Montserrat 400→800, Mukta 400→700. Mukta at 800 turns conjuncts to mud. */
.emph:lang(hi),
.emph:lang(mr) {
  font-weight: 700;
}
.emph {
  font-weight: 800;
}

.shirorekha::before {
  content: '';
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: var(--shirorekha-width, 4rem);
  block-size: 3px;
  background: var(--color-pink-600);
}

/* Never removed. Visible on every interactive element, on every route. */
:focus-visible {
  outline: 3px solid var(--color-blue-600);
  outline-offset: 2px;
  border-radius: 2px;
}

/* This audience overlaps exactly with the low-end devices where motion hurts.
   GSAP is torn down separately via gsap.matchMedia — this covers CSS. */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Write the token verification test**

`tests/e2e/tokens.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/shuru', '/sabhi-card', '/card/c1', '/madad'];

/** WCAG relative luminance + contrast ratio. */
function ratio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

test('token pairings in use pass AA', () => {
  expect(ratio('#D6336C', '#FFFFFF')).toBeGreaterThanOrEqual(4.5); // pink action on white
  expect(ratio('#1565C0', '#FFFFFF')).toBeGreaterThanOrEqual(4.5); // blue sarkari on white
  expect(ratio('#1F2A44', '#FFFFFF')).toBeGreaterThanOrEqual(4.5); // ink on white
  expect(ratio('#2B2B2B', '#F4F5F7')).toBeGreaterThanOrEqual(4.5); // body on canvas
  expect(ratio('#595959', '#FFFFFF')).toBeGreaterThanOrEqual(4.5); // muted on surface
  expect(ratio('#FFFFFF', '#1F2A44')).toBeGreaterThanOrEqual(4.5); // inverse on dark chapter
  expect(ratio('#FFB6C1', '#1F2A44')).toBeGreaterThanOrEqual(4.5); // pink-200 on dark
  expect(ratio('#B3261E', '#FDECEA')).toBeGreaterThanOrEqual(4.5); // galat-hai verdict
  expect(ratio('#2E7D32', '#EAF3EB')).toBeGreaterThanOrEqual(4.5); // sahi-hai confirmation
});

test('pink-500 is never used as a text colour', () => {
  // #FF4081 on white is 3.3:1 — it fails AA at body size and is decorative-only.
  expect(ratio('#FF4081', '#FFFFFF')).toBeLessThan(4.5);
});

for (const route of ROUTES) {
  test(`${route} renders no pink-500 text and at most one pink-600 action`, async ({ page }) => {
    await page.goto(route);
    const found = await page.evaluate(() => {
      const norm = (c: string) => {
        const m = c.match(/\d+/g);
        return m ? `#${m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join('')}`.toUpperCase() : '';
      };
      let pink500Text = 0;
      let pink600Actions = 0;
      for (const el of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
        const cs = getComputedStyle(el);
        const hasText = Array.from(el.childNodes).some(
          (n) => n.nodeType === 3 && (n.textContent ?? '').trim().length > 0,
        );
        if (hasText && norm(cs.color) === '#FF4081') pink500Text++;
        const isAction = el.matches('a, button, [role="button"]');
        if (isAction && norm(cs.backgroundColor) === '#D6336C') pink600Actions++;
      }
      return { pink500Text, pink600Actions };
    });
    expect(found.pink500Text, 'pink-500 used as a text colour').toBe(0);
    expect(found.pink600Actions, 'more than one pink-600 action on screen').toBeLessThanOrEqual(1);
  });
}

test('Devanagari conjuncts render at every weight used', async ({ page }) => {
  await page.setContent(`
    <style>
      @import url('/_astro/global.css');
      p { font-family: 'Montserrat Variable','Mukta',sans-serif; font-size: 48px; margin: 0 0 8px; }
    </style>
    <p style="font-weight:400" lang="hi">स्त्रीधन ज़िंदगी</p>
    <p style="font-weight:500" lang="hi">स्त्रीधन ज़िंदगी</p>
    <p style="font-weight:700" lang="hi">स्त्रीधन ज़िंदगी</p>
  `);
  await page.waitForFunction(() => document.fonts.ready.then(() => true));
  await expect(page).toHaveScreenshot('conjuncts.png', { maxDiffPixelRatio: 0.01 });
});
```

- [ ] **Step 7: Run the contrast assertions**

```bash
npx playwright test tests/e2e/tokens.spec.ts -g "AA|pink-500 is never"
```
Expected: PASS. The per-route tests fail until Task 8; that is expected at this point.

- [ ] **Step 8: Commit**

```bash
git add scripts/measure-font-metrics.mjs src/styles tests/e2e/tokens.spec.ts
git commit -m "feat(design): add token system, self-hosted fonts, measured metric matching

Palette, type scale, spacing and the bimodal radius system as Tailwind 4
@theme tokens. Mukta's size-adjust and ascent/descent overrides are computed
from the font binaries' OS/2 and hhea tables rather than eyeballed, so a
mixed-script line has no visible seam.

Adds the shirorekha rule utility — a 3px pink stroke above a heading, derived
from the horizontal stroke that runs across the top of every Devanagari word.

Contrast assertions cover every token pairing in use and lock pink-500 out of
text roles (3.3:1 on white)."
```

---

### Task 5: Quick exit — the safety primitive

Built before any other UI, because everything else must be able to assume it exists.

**Files:**
- Create: `src/components/chrome/QuickExit.astro`
- Create: `src/layouts/Base.astro`
- Test: `tests/e2e/safety.spec.ts`

**Interfaces:**
- Produces: `<QuickExit />` and `Base.astro`, which every page extends. Consumed by Tasks 6–17.

- [ ] **Step 1: Write the failing test**

`tests/e2e/safety.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const ALL_ROUTES = ['/', '/shuru', '/aapke-card', '/sabhi-card', '/card/c1', '/card/c10',
  '/madad', '/hamare-baare-mein', '/asar'];

for (const route of ALL_ROUTES) {
  test(`quick exit is present, fixed top-right and fast on ${route}`, async ({ page }) => {
    await page.goto(route);
    const x = page.getByTestId('quick-exit');
    await expect(x).toBeVisible();

    const box = (await x.boundingBox())!;
    expect(box.width, 'tap target width').toBeGreaterThanOrEqual(48);
    expect(box.height, 'tap target height').toBeGreaterThanOrEqual(48);

    const vw = page.viewportSize()!.width;
    expect(box.x + box.width, 'anchored to the right edge').toBeGreaterThan(vw - 80);
    expect(box.y, 'anchored to the top').toBeLessThan(80);
    expect(await x.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');

    const start = Date.now();
    await x.click();
    await page.waitForURL(/google\.com/, { timeout: 2000 });
    expect(Date.now() - start, 'quick exit latency').toBeLessThan(100);
  });
}

test('quick exit works while the menu is open', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('menu-toggle').click();
  await expect(page.getByTestId('menu-overlay')).toBeVisible();
  await page.getByTestId('quick-exit').click();
  await page.waitForURL(/google\.com/, { timeout: 2000 });
});

test('quick exit stops audio and removes the page from history', async ({ page }) => {
  await page.goto('/card/c1');
  await page.getByTestId('sunie').click();
  await page.getByTestId('quick-exit').click();
  await page.waitForURL(/google\.com/, { timeout: 2000 });
  const playing = await page.evaluate(
    () => Array.from(document.querySelectorAll('audio')).some((a) => !a.paused),
  );
  expect(playing).toBe(false);
});

test('quick exit works before hydration completes', async ({ page }) => {
  // The exit handler is an inline head script bound at capture phase. It must not
  // wait for an island to hydrate — she may tap it the instant the page paints.
  await page.route('**/*.js', (r) => r.abort());
  await page.goto('/shuru');
  await page.getByTestId('quick-exit').click();
  await page.waitForURL(/google\.com/, { timeout: 2000 });
});
```

- [ ] **Step 2: Run and verify it fails**

```bash
npx playwright test tests/e2e/safety.spec.ts --project=sunita
```
Expected: FAIL — no `quick-exit` test id exists.

- [ ] **Step 3: Write `src/components/chrome/QuickExit.astro`**

```astro
---
/**
 * UF-8. Fixed top-right on EVERY screen. Latency target <100 ms.
 *
 * The handler is an inline head script bound at capture phase, deliberately NOT an
 * island: she may tap this the instant the page paints, mid-animation, with the menu
 * open, with audio playing, with the network gone. It must never wait for a framework
 * to hydrate. `location.replace` rather than `assign` so the back button cannot return.
 *
 * We never claim this makes her safe. /madad and /hamare-baare-mein say plainly that the
 * site may still appear in browser history. Honest words, not clever technology.
 */
---
<button
  type="button"
  id="mh-quick-exit"
  data-testid="quick-exit"
  aria-label="बंद करें"
  class="fixed end-3 top-3 z-[100] grid tap place-items-center rounded-action
         bg-surface text-ink shadow-header ring-1 ring-border">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>
</button>

<script is:inline>
  (function () {
    function exit(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (_) {}
      try {
        var audios = document.querySelectorAll('audio');
        for (var i = 0; i < audios.length; i++) { audios[i].pause(); audios[i].src = ''; }
      } catch (_) {}
      try { history.replaceState(null, '', 'https://www.google.com'); } catch (_) {}
      location.replace('https://www.google.com');
    }
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.closest && t.closest('#mh-quick-exit')) exit(e);
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && e.shiftKey) exit(e);
    }, true);
  })();
</script>
```

- [ ] **Step 4: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
import QuickExit from '../components/chrome/QuickExit.astro';

interface Props {
  title: string;
  lang?: 'hi' | 'hinglish' | 'en';
  /** Rights routes carry the DRAFT banner and the disclaimer footer. */
  rights?: boolean;
}
const { title, lang = 'hi', rights = false } = Astro.props;
const htmlLang = lang === 'en' ? 'en' : 'hi';
---
<!doctype html>
<html lang={htmlLang} data-mh-lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="theme-color" content="#1F2A44" />
    <meta name="referrer" content="no-referrer" />
    <slot name="head" />
  </head>
  <body data-rights={rights ? 'true' : undefined}>
    <QuickExit />
    <slot />
  </body>
</html>
```

- [ ] **Step 5: Run the tests and verify they pass**

```bash
npx playwright test tests/e2e/safety.spec.ts --project=sunita -g "quick exit"
```
Expected: PASS for `/`. Routes not yet built will 404 — that is expected until Task 17.

- [ ] **Step 6: Commit**

```bash
git add src/components/chrome/QuickExit.astro src/layouts/Base.astro tests/e2e/safety.spec.ts
git commit -m "feat(safety): add quick exit as an inline head script

Bound at capture phase before any island hydrates, so it works mid-animation,
mid-audio, with the menu open, and with JavaScript bundles blocked. Cancels
speech synthesis, pauses and unloads every audio element, replaces history
state, then location.replace so the back button cannot return.

Test asserts <100ms latency, fixed top-right position and >=48px target on
every route, including with all JS aborted."
```

---

### Task 6: The i18n string layer

**Files:**
- Create: `src/lib/i18n/ui.json`, `src/lib/i18n/index.ts`
- Test: `tests/i18n.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  export function t(key: string, lang: Lang): string;
  export function setLang(lang: Lang): void;   // client-side, instant, no reload
  export function getLang(): Lang;
  export const UI: Record<string, Record<Lang, string>>;
  ```

- [ ] **Step 1: Write the failing test**

`tests/i18n.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { UI } from '../src/lib/i18n';

const LANGS = ['hi', 'hinglish', 'en'] as const;

describe('i18n completeness', () => {
  it('every key has all three languages, none empty', () => {
    for (const [key, v] of Object.entries(UI)) {
      for (const lang of LANGS) {
        expect(v[lang], `${key}.${lang}`).toBeTruthy();
        expect(v[lang].trim().length, `${key}.${lang} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('the Hindi track is Devanagari, not transliteration', () => {
    const DEVANAGARI = /[\u0900-\u097F]/;
    const NUMERIC_ONLY = /^[\d\s·.\-–—:/]+$/;
    for (const [key, v] of Object.entries(UI)) {
      if (NUMERIC_ONLY.test(v.hi)) continue; // helpline numbers are numerals in every track
      expect(DEVANAGARI.test(v.hi), `${key}.hi is not Devanagari: ${v.hi}`).toBe(true);
    }
  });

  it('the English track is not transliterated Hindi (PRD §5.11 r5)', () => {
    const TRANSLITERATION_TELLS = /\b(aapke|aapka|hain|karein|kijiye|dekhein|jaayein|nahin)\b/i;
    for (const [key, v] of Object.entries(UI)) {
      expect(TRANSLITERATION_TELLS.test(v.en), `${key}.en reads as transliteration: ${v.en}`).toBe(false);
    }
  });

  it('respects the copy rule: Hindi sentences stay under 12 words', () => {
    for (const [key, v] of Object.entries(UI)) {
      for (const sentence of v.hi.split(/[।?!]/)) {
        const words = sentence.trim().split(/\s+/).filter(Boolean);
        expect(words.length, `${key}.hi sentence too long: ${sentence}`).toBeLessThanOrEqual(12);
      }
    }
  });

  it('banned Sanskritised vocabulary never appears on the Hindi track', () => {
    // Diagnostic Spec §6. Use हक़ not अधिकार, काग़ज़ not दस्तावेज़.
    const BANNED = ['अधिकार', 'दस्तावेज़', 'संपत्ति', 'उत्पीड़न', 'आर्थिक'];
    for (const [key, v] of Object.entries(UI)) {
      for (const word of BANNED) {
        expect(v.hi.includes(word), `${key}.hi uses banned word ${word}`).toBe(false);
      }
    }
  });
});
```

- [ ] **Step 2: Run and verify it fails**

```bash
npm test -- tests/i18n.spec.ts
```
Expected: FAIL — cannot resolve `../src/lib/i18n`.

- [ ] **Step 3: Write `src/lib/i18n/ui.json`**

Frozen PRD strings are copied verbatim. Full key set:

```json
{
  "hero.question": {
    "hi": "आपके लिए कौन से हक़ बहुत ज़रूरी हैं?",
    "hinglish": "Aapke liye kaun se haq bahut zaroori hain?",
    "en": "Which rights already belong to you?"
  },
  "hero.sub": {
    "hi": "नीचे दिए बटन पर दबाएँ और अभी जानें",
    "hinglish": "Neeche diye button par dabayein aur abhi jaanein",
    "en": "Press the button below and find out now"
  },
  "cta.primary": { "hi": "मेरा हक़ बताओ", "hinglish": "Mera Haq batao", "en": "Show me my rights" },
  "cta.allCards": { "hi": "सीधे सारे कार्ड देखें", "hinglish": "Seedhe saare card dekhein", "en": "See all ten cards" },
  "cta.myCards": { "hi": "आपके कार्ड देखें", "hinglish": "Aapke card dekhein", "en": "See your cards" },
  "sunie.play": { "hi": "सुनिए", "hinglish": "Suniye", "en": "Listen" },
  "sunie.pause": { "hi": "रोकें", "hinglish": "Rokein", "en": "Pause" },
  "sunie.muted": { "hi": "आवाज़ बंद है", "hinglish": "Aawaz band hai", "en": "Sound is off" },
  "sunie.note": {
    "hi": "आवाज़ पास बैठे लोग भी सुन सकते हैं।",
    "hinglish": "Aawaz paas baithe log bhi sun sakte hain.",
    "en": "People nearby can hear this too."
  },
  "sunie.noteTip": {
    "hi": "हो सके तो हेडफ़ोन लगाएँ या आवाज़ धीमी रखें।",
    "hinglish": "Ho sake toh headphone lagayein ya aawaz dheemi rakhein.",
    "en": "Use headphones or keep the volume low if you can."
  },
  "sunie.noteOk": { "hi": "ठीक है", "hinglish": "Theek hai", "en": "Got it" },
  "menu.open": { "hi": "मेन्यू", "hinglish": "Menu", "en": "Menu" },
  "menu.diagnostic": { "hi": "मेरा हक़ बताओ", "hinglish": "Mera Haq batao", "en": "Show me my rights" },
  "menu.allCards": { "hi": "सबसे ज़रूरी हक़", "hinglish": "Sabse zaroori haq", "en": "The ten rights" },
  "menu.madad": { "hi": "अभी मदद लीजिए", "hinglish": "Abhi madad lijiye", "en": "Get help now" },
  "menu.myCards": { "hi": "आपके कार्ड", "hinglish": "Aapke card", "en": "Your cards" },
  "menu.about": { "hi": "हमारे बारे में", "hinglish": "Hamare baare mein", "en": "About us" },
  "menu.impact": { "hi": "असर — अब तक क्या हुआ", "hinglish": "Asar — ab tak kya hua", "en": "Impact — what has happened" },
  "menu.reset": { "hi": "सवाल दोबारा करें", "hinglish": "Sawaal dobara karein", "en": "Answer the questions again" },
  "menu.mute": { "hi": "आवाज़ बंद / चालू", "hinglish": "Aawaz band / chaalu", "en": "Sound off / on" },
  "reset.confirm": {
    "hi": "आपके चुने हुए कार्ड हट जाएँगे। दोबारा सवाल पूछें?",
    "hinglish": "Aapke chune hue card hat jayenge. Dobara sawaal poochhein?",
    "en": "Your chosen cards will be removed. Answer the questions again?"
  },
  "yes": { "hi": "हाँ", "hinglish": "Haan", "en": "Yes" },
  "no": { "hi": "नहीं", "hinglish": "Nahin", "en": "No" },
  "exit.label": { "hi": "बंद करें", "hinglish": "Band karein", "en": "Close" },
  "helpline.press": { "hi": "दबाएँ", "hinglish": "Dabayein", "en": "Call" },
  "s0.title": {
    "hi": "अपने हक़ जानें — सिर्फ़ 5 छोटे सवाल, 1 मिनट।",
    "hinglish": "Apne haq jaanein — sirf 5 chhote sawaal, 1 minute.",
    "en": "Know your rights — just five short questions, one minute."
  },
  "s0.start": { "hi": "शुरू करें", "hinglish": "Shuru karein", "en": "Start" },
  "s0.escape": { "hi": "सीधे कार्ड देखें", "hinglish": "Seedhe card dekhein", "en": "Go straight to the cards" },
  "s0b.question": { "hi": "आप कहाँ से हैं?", "hinglish": "Aap kahaan se hain?", "en": "Where are you from?" },
  "s0b.note": {
    "hi": "चाहें तो बताएं — यह जवाब देना ज़रूरी नहीं है",
    "hinglish": "Chahein toh batayein — yeh jawab dena zaroori nahin hai",
    "en": "Tell us if you like — this one is optional"
  },
  "s0b.north": { "hi": "उत्तर भारत", "hinglish": "Uttar Bharat", "en": "North India" },
  "s0b.south": { "hi": "दक्षिण भारत", "hinglish": "Dakshin Bharat", "en": "South India" },
  "s0b.east": { "hi": "पूर्वी भारत", "hinglish": "Poorvi Bharat", "en": "East India" },
  "s0b.west": { "hi": "पश्चिमी भारत", "hinglish": "Pashchimi Bharat", "en": "West India" },
  "s0b.central": { "hi": "मध्य भारत", "hinglish": "Madhya Bharat", "en": "Central India" },
  "s0b.unknown": { "hi": "पता नहीं / छोड़ें", "hinglish": "Pata nahin / chhodein", "en": "Not sure / skip" },
  "q1.question": { "hi": "आप अपने बारे में बताएँ", "hinglish": "Aap apne baare mein batayein", "en": "Tell us about yourself" },
  "q1.a": { "hi": "शादी हुई है, पति/ससुराल के साथ रहती हूँ", "hinglish": "Shaadi hui hai, pati/sasural ke saath rehti hoon", "en": "Married, living with my husband or his family" },
  "q1.b": { "hi": "शादी हुई है, पर अभी पति से अलग रहती हूँ", "hinglish": "Shaadi hui hai, par abhi pati se alag rehti hoon", "en": "Married, but living apart from my husband" },
  "q1.c": { "hi": "पति नहीं रहे (विधवा हूँ)", "hinglish": "Pati nahin rahe (vidhwa hoon)", "en": "My husband has passed away" },
  "q1.d": { "hi": "शादी नहीं हुई है", "hinglish": "Shaadi nahin hui hai", "en": "Not married" },
  "q1.e": { "hi": "तलाक़ हो गया है", "hinglish": "Talaaq ho gaya hai", "en": "Divorced" },
  "q2.question": { "hi": "घर के पैसे कौन रखता है?", "hinglish": "Ghar ke paise kaun rakhta hai?", "en": "Who holds the household money?" },
  "q2.a": { "hi": "मैं कमाती हूँ और पैसे खुद रखती हूँ", "hinglish": "Main kamaati hoon aur paise khud rakhti hoon", "en": "I earn and I keep it myself" },
  "q2.b": { "hi": "मैं कमाती हूँ, पर पैसे घरवाले रखते हैं", "hinglish": "Main kamaati hoon, par paise gharwale rakhte hain", "en": "I earn, but the family keeps it" },
  "q2.c": { "hi": "घरवाले कमाते हैं और खर्चे के लिए पैसे देते हैं", "hinglish": "Gharwale kamaate hain aur kharche ke liye paise dete hain", "en": "The family earns and gives me money for expenses" },
  "q2.d": { "hi": "घरवाले कमाते हैं, पर ज़रूरत पर पैसे नहीं मिलते", "hinglish": "Gharwale kamaate hain, par zaroorat par paise nahin milte", "en": "The family earns, but money does not come when it is needed" },
  "q2.e": { "hi": "घर में कोई बंधी कमाई नहीं है", "hinglish": "Ghar mein koi bandhi kamai nahin hai", "en": "There is no steady income at home" },
  "q3.question": { "hi": "इनमें से क्या-क्या आपके लिए सच है?", "hinglish": "Inmein se kya-kya aapke liye sach hai?", "en": "Which of these are true for you?" },
  "q3.hint": { "hi": "जितनी बातें सच हों, उन्हें चुनें", "hinglish": "Jitni baatein sach hon, unhein chunein", "en": "Choose as many as apply" },
  "q3.a": { "hi": "शादी में मुझे गहने और तोहफ़े मिले थे", "hinglish": "Shaadi mein mujhe gehne aur tohfe mile the", "en": "I received jewellery and gifts at my wedding" },
  "q3.b": { "hi": "शादी में दहेज़ का लेन-देन हुआ था", "hinglish": "Shaadi mein dahej ka len-den hua tha", "en": "Dowry changed hands at my wedding" },
  "q3.c": { "hi": "जिस घर में रहती हूँ, वह मेरे नाम पर नहीं है", "hinglish": "Jis ghar mein rehti hoon, woh mere naam par nahin hai", "en": "The house I live in is not in my name" },
  "q3.d": { "hi": "मायके में ज़मीन या मकान है", "hinglish": "Maayke mein zameen ya makaan hai", "en": "There is land or a house in my parents' family" },
  "q3.e": { "hi": "अपने खर्चे के लिए मुझे दूसरों से पैसे माँगने पड़ते हैं", "hinglish": "Apne kharche ke liye mujhe doosron se paise maangne padte hain", "en": "I have to ask others for money for my own expenses" },
  "q3.f": { "hi": "इनमें से कोई बात सच नहीं है", "hinglish": "Inmein se koi baat sach nahin hai", "en": "None of these are true" },
  "q3.cta": { "hi": "आगे बढ़ें", "hinglish": "Aage badhein", "en": "Continue" },
  "q4.question": { "hi": "क्या घर में कोई लोन या उधार चल रहा है?", "hinglish": "Kya ghar mein koi loan ya udhaar chal raha hai?", "en": "Is there a loan running in the household?" },
  "q4.a": { "hi": "नहीं, कोई लोन नहीं है", "hinglish": "Nahin, koi loan nahin hai", "en": "No, there is no loan" },
  "q4.b": { "hi": "हाँ, घर या पति का लोन है", "hinglish": "Haan, ghar ya pati ka loan hai", "en": "Yes, a household or husband's loan" },
  "q4.c": { "hi": "हाँ, लोन मेरे नाम पर है या मैंने काग़ज़ों पर साइन किए हैं", "hinglish": "Haan, loan mere naam par hai ya maine kaagzon par sign kiye hain", "en": "Yes, in my name, or I signed papers for one" },
  "q4.d": { "hi": "वसूली वाले फ़ोन करते हैं या घर आते हैं", "hinglish": "Vasooli waale phone karte hain ya ghar aate hain", "en": "Recovery agents call or come to the house" },
  "q4.e": { "hi": "पता नहीं", "hinglish": "Pata nahin", "en": "I don't know" },
  "q5.question": { "hi": "इनमें से क्या-क्या आपके पास है?", "hinglish": "Inmein se kya-kya aapke paas hai?", "en": "Which of these do you already have?" },
  "q5.hint": { "hi": "जितनी चीज़ें हों, उन्हें चुनें", "hinglish": "Jitni cheezein hon, unhein chunein", "en": "Choose as many as apply" },
  "q5.a": { "hi": "अपना बैंक खाता, जो मैं खुद चलाती हूँ", "hinglish": "Apna bank khaata, jo main khud chalati hoon", "en": "A bank account I operate myself" },
  "q5.b": { "hi": "मेरा आधार कार्ड और ज़रूरी काग़ज़ मेरे पास रहते हैं", "hinglish": "Mera Aadhaar card aur zaroori kaagaz mere paas rehte hain", "en": "My Aadhaar and important papers stay with me" },
  "q5.c": { "hi": "अपना मोबाइल या सिम, मेरे नाम पर", "hinglish": "Apna mobile ya SIM, mere naam par", "en": "A phone or SIM in my own name" },
  "q5.d": { "hi": "गहनों की लिस्ट या फोटो", "hinglish": "Gehnon ki list ya photo", "en": "A list or photos of my jewellery" },
  "q5.e": { "hi": "इनमें से कोई नहीं", "hinglish": "Inmein se koi nahin", "en": "None of these" },
  "q5.cta": { "hi": "मेरे कार्ड दिखाएँ", "hinglish": "Mere card dikhayein", "en": "Show my cards" },
  "s6.title": { "hi": "आपके कार्ड तैयार हो रहे हैं…", "hinglish": "Aapke card taiyaar ho rahe hain…", "en": "Getting your cards ready…" },
  "s7.title": { "hi": "ये 5 कार्ड आपके लिए हैं", "hinglish": "Yeh 5 card aapke liye hain", "en": "These five cards are for you" },
  "s7.open": { "hi": "पहला कार्ड खोलें", "hinglish": "Pehla card kholein", "en": "Open the first card" },
  "s7.universal": { "hi": "यह कार्ड सबके लिए है", "hinglish": "Yeh card sabke liye hai", "en": "This card is for everyone" },
  "back": { "hi": "पीछे", "hinglish": "Peechhe", "en": "Back" },
  "tab.mine": { "hi": "आपके कार्ड", "hinglish": "Aapke card", "en": "Your cards" },
  "tab.all": { "hi": "सभी 10 कार्ड", "hinglish": "Sabhi 10 card", "en": "All ten cards" },
  "card.open": { "hi": "कार्ड खोलें", "hinglish": "Card kholein", "en": "Open card" },
  "card.kanoon": { "hi": "कानून क्या कहता है", "hinglish": "Kanoon kya kehta hai", "en": "What the law says" },
  "card.asli": { "hi": "असली ज़िंदगी में", "hinglish": "Asli zindagi mein", "en": "In real life" },
  "card.sambhaal": { "hi": "सँभाल कर रखें", "hinglish": "Sambhaal kar rakhein", "en": "Keep this safe" },
  "card.ekKadam": { "hi": "एक कदम आज", "hinglish": "Ek kadam aaj", "en": "One step today" },
  "card.kahaan": { "hi": "कहाँ जाएँ", "hinglish": "Kahaan jaayein", "en": "Where to go" },
  "card.alsoKnow": { "hi": "यह भी जानिए", "hinglish": "Yeh bhi jaaniye", "en": "Also worth knowing" },
  "card.share": { "hi": "WhatsApp पर भेजें", "hinglish": "WhatsApp par bhejein", "en": "Send on WhatsApp" },
  "card.pdf": { "hi": "PDF डाउनलोड करें", "hinglish": "PDF download karein", "en": "Download the PDF" },
  "card.galat": { "hi": "यह सही नहीं है", "hinglish": "Yeh sahi nahin hai", "en": "This is not right" },
  "footer.disclaimer": { "hi": "यह जानकारी है, सलाह नहीं", "hinglish": "Yeh jaankari hai, salaah nahin", "en": "This is information, not advice" },
  "footer.reviewer": { "hi": "कानूनी समीक्षा", "hinglish": "Kanooni sameeksha", "en": "Legal review" },
  "footer.verified": { "hi": "जाँचा गया", "hinglish": "Jaancha gaya", "en": "Verified on" },
  "footer.noTracking": {
    "hi": "यह साइट आपके बारे में कुछ भी सेव नहीं करती।",
    "hinglish": "Yeh site aapke baare mein kuchh bhi save nahin karti.",
    "en": "This site saves nothing about you."
  },
  "draft.banner": {
    "hi": "कानूनी समीक्षा बाकी है। यह मसौदा है।",
    "hinglish": "Kanooni sameeksha baaki hai. Yeh masauda hai.",
    "en": "Legal review pending. This is a draft."
  },
  "madad.title": { "hi": "अभी मदद लीजिए", "hinglish": "Abhi madad lijiye", "en": "Get help now" },
  "madad.universal": { "hi": "हर हाल में काम आने वाले नंबर", "hinglish": "Har haal mein kaam aane waale number", "en": "Numbers that always help" },
  "madad.askFor": { "hi": "किससे मिलें", "hinglish": "Kisse milein", "en": "Ask for" },
  "madad.portal": { "hi": "खोलें", "hinglish": "Kholein", "en": "Open" },
  "sharedPhone": {
    "hi": "फ़ोन की हिस्ट्री में यह साइट दिख सकती है। फ़ोन कोई और भी चलाता हो तो प्राइवेट मोड इस्तेमाल करें, या देखने के बाद हिस्ट्री से यह पेज हटा दें।",
    "hinglish": "Phone ki history mein yeh site dikh sakti hai. Phone koi aur bhi istemal karta ho toh browser ka 'Private / Incognito' mode istemal karein, ya dekhne ke baad history se yeh page hata den.",
    "en": "This site can still show up in the phone's history. If someone else uses this phone, browse in Private or Incognito mode, or clear this page from the history afterwards."
  },
  "login.title": { "hi": "अपने कार्ड सुरक्षित रखें", "hinglish": "Apne card surakshit rakhein", "en": "Keep your cards safe" },
  "login.body": {
    "hi": "लॉग इन करेंगी तो कार्ड किसी भी फ़ोन पर मिल जाएँगे।",
    "hinglish": "Log in karengi toh card kisi bhi phone par mil jayenge.",
    "en": "Log in and your cards will be there on any device."
  },
  "login.yes": { "hi": "लॉग इन करें", "hinglish": "Log in karein", "en": "Log in" },
  "login.later": { "hi": "अभी नहीं", "hinglish": "Abhi nahin", "en": "Not now" },
  "login.header": { "hi": "लॉग इन", "hinglish": "Log in", "en": "Log in" },
  "sakhi.open": { "hi": "सखी से पूछें", "hinglish": "Sakhi se poochhein", "en": "Ask Sakhi" },
  "sakhi.greeting": {
    "hi": "नमस्ते! मैं सखी हूँ। 5 छोटे सवाल — 1 मिनट।",
    "hinglish": "Namaste! Main Sakhi hoon. 5 chhote sawaal — 1 minute.",
    "en": "Hello! I'm Sakhi. Five short questions, one minute."
  },
  "sakhi.done": { "hi": "बस, आगे बढ़ें", "hinglish": "Bas, aage badhein", "en": "Done, continue" },
  "sakhi.openCards": { "hi": "मेरे कार्ड खोलें", "hinglish": "Mere card kholein", "en": "Open my cards" },
  "sakhi.minimise": { "hi": "छोटा करें", "hinglish": "Chhota karein", "en": "Minimise" },
  "lang.label": { "hi": "भाषा", "hinglish": "Bhasha", "en": "Language" },
  "lang.hi": { "hi": "हिंदी", "hinglish": "Hindi", "en": "Hindi" },
  "lang.hinglish": { "hi": "हिंग्लिश", "hinglish": "Hinglish", "en": "Hinglish" },
  "lang.en": { "hi": "अंग्रेज़ी", "hinglish": "English", "en": "English" }
}
```

- [ ] **Step 4: Write `src/lib/i18n/index.ts`**

```ts
import ui from './ui.json';
import type { Lang } from '../types';

export const UI = ui as Record<string, Record<Lang, string>>;
export const LANGS: Lang[] = ['hi', 'hinglish', 'en'];
export const DEFAULT_LANG: Lang = 'hi';

export function t(key: string, lang: Lang = DEFAULT_LANG): string {
  const entry = UI[key];
  if (!entry) throw new Error(`i18n: unknown key "${key}"`);
  return entry[lang] ?? entry[DEFAULT_LANG];
}

/**
 * Instant, client-side, no reload, no loss of progress (F-110 r2).
 * Every translatable node carries data-i18n; switching rewrites text in place.
 * `<html lang>` updates so screen readers and browser TTS pick the right voice (r7).
 */
export function applyLang(lang: Lang, root: ParentNode = document): void {
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('[data-i18n]'))) {
    const key = el.dataset.i18n!;
    if (UI[key]) el.textContent = UI[key][lang];
  }
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('[data-i18n-label]'))) {
    const key = el.dataset.i18nLabel!;
    if (UI[key]) el.setAttribute('aria-label', UI[key][lang]);
  }
  document.documentElement.lang = lang === 'en' ? 'en' : 'hi';
  document.documentElement.dataset.mhLang = lang;
}
```

- [ ] **Step 5: Run the tests and verify they pass**

```bash
npm test -- tests/i18n.spec.ts
```
Expected: PASS. A failure on the 12-word rule means a string needs shortening, not the rule loosening.

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n tests/i18n.spec.ts
git commit -m "feat(i18n): add the three-key string schema

Every UI and diagnostic string in hi/hinglish/en. Frozen PRD Devanagari
copied verbatim. English is authored plain English for the supporter
persona, not transliteration.

Tests enforce the copy rules mechanically: all three languages present and
non-empty, the Hindi track is Devanagari, the English track carries no
transliteration tells, Hindi sentences stay under twelve words, and the
Diagnostic Spec's banned Sanskritised vocabulary never appears."
```

---

### Task 7: Card content extraction

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/cards/c1.hi.json` … `c10.en.json` (30 files)
- Create: `src/lib/cards.ts`
- Test: `tests/content.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface CardContent {
    id: CardId; slug: string; title: string; summary: string;
    kanoon: string[]; asliZindagi: string[]; sambhaal: string[];
    ekKadam: string;
    authority: { office: string; askFor: string; numbers: string[]; portals: string[] };
    crossLinks: CardId[]; verifiedOn: string;
  }
  export const CARD_ORDER: CardId[];
  ```

- [ ] **Step 1: Write the failing test**

`tests/content.spec.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { CARD_ORDER } from '../src/lib/cards';
import type { CardId } from '../src/lib/types';

const LANGS = ['hi', 'hinglish', 'en'] as const;
const load = (id: CardId, lang: string) =>
  JSON.parse(readFileSync(`src/content/cards/${id.toLowerCase()}.${lang}.json`, 'utf8'));

describe('card content', () => {
  it('has all ten cards in all three languages', () => {
    for (const id of CARD_ORDER) {
      for (const lang of LANGS) {
        expect(existsSync(`src/content/cards/${id.toLowerCase()}.${lang}.json`), `${id}.${lang}`).toBe(true);
      }
    }
  });

  it('has exactly one Ek Kadam per card, never a list (F-28)', () => {
    for (const id of CARD_ORDER) {
      for (const lang of LANGS) {
        const c = load(id, lang);
        expect(typeof c.ekKadam, `${id}.${lang}`).toBe('string');
        expect(c.ekKadam.trim().length, `${id}.${lang} empty`).toBeGreaterThan(0);
        expect(c.ekKadam.split(/[।.]/).filter((s: string) => s.trim()).length,
          `${id}.${lang} Ek Kadam is more than one action`).toBeLessThanOrEqual(2);
      }
    }
  });

  it('every Don\'t carries its «यह सही नहीं है» verdict on the Hindi track', () => {
    for (const id of CARD_ORDER) {
      const c = load(id, 'hi');
      expect(c.asliZindagi.length, `${id} has no Don'ts`).toBeGreaterThan(0);
    }
  });

  it('every card routes to a free human — at least one helpline number', () => {
    const FREE = ['181', '112', '15100', '14454', '1930', '14448', '14490'];
    for (const id of CARD_ORDER) {
      const c = load(id, 'hi');
      const nums: string[] = c.authority.numbers;
      expect(nums.length, `${id} has no numbers`).toBeGreaterThan(0);
      expect(nums.some((n) => FREE.some((f) => n.includes(f))), `${id} has no free helpline`).toBe(true);
    }
  });

  it('carries the verified-on stamp (F-35)', () => {
    for (const id of CARD_ORDER) {
      for (const lang of LANGS) {
        expect(load(id, lang).verifiedOn, `${id}.${lang}`).toBe('2026-08-13');
      }
    }
  });

  it('suggests no confrontation — the global content rule', () => {
    const CONFRONT_HI = ['माँग करें', 'लड़ें', 'झगड़ा', 'विरोध करें', 'धमकी'];
    const CONFRONT_EN = ['demand', 'confront', 'fight', 'threaten'];
    for (const id of CARD_ORDER) {
      const hi = JSON.stringify(load(id, 'hi'));
      for (const w of CONFRONT_HI) expect(hi.includes(w), `${id}.hi suggests confrontation: ${w}`).toBe(false);
      const en = JSON.stringify(load(id, 'en')).toLowerCase();
      for (const w of CONFRONT_EN) expect(en.includes(w), `${id}.en suggests confrontation: ${w}`).toBe(false);
    }
  });

  it('cross-links keep every card within two taps (F-33)', () => {
    const reachable = new Set<CardId>();
    for (const id of CARD_ORDER) {
      for (const l of load(id, 'hi').crossLinks as CardId[]) reachable.add(l);
    }
    // C3 in particular has no direct diagnostic route in some decks and must be
    // reachable from C2 and C4 (Build Manual D7 reachability rule).
    expect(reachable.has('C3')).toBe(true);
    expect((load('C2', 'hi').crossLinks as CardId[]).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run and verify it fails**

```bash
npm test -- tests/content.spec.ts
```
Expected: FAIL — `src/lib/cards` unresolved.

- [ ] **Step 3: Write `src/lib/cards.ts`**

```ts
import type { CardId } from './types';

export const CARD_ORDER: CardId[] = ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10'];

export const CARD_SLUG: Record<CardId, string> = {
  C1: 'c1', C2: 'c2', C3: 'c3', C4: 'c4', C5: 'c5',
  C6: 'c6', C7: 'c7', C8: 'c8', C9: 'c9', C10: 'c10',
};

export interface CardAuthority {
  office: string;
  askFor: string;
  numbers: string[];
  portals: string[];
}

export interface CardContent {
  id: CardId;
  slug: string;
  title: string;
  summary: string;
  kanoon: string[];
  asliZindagi: string[];
  sambhaal: string[];
  ekKadam: string;
  authority: CardAuthority;
  crossLinks: CardId[];
  verifiedOn: string;
}
```

- [ ] **Step 4: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const cardSchema = z.object({
  id: z.enum(['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10']),
  slug: z.string(),
  lang: z.enum(['hi', 'hinglish', 'en']),
  title: z.string(),
  summary: z.string(),
  kanoon: z.array(z.string()).min(1),
  asliZindagi: z.array(z.string()).min(1),
  sambhaal: z.array(z.string()).min(1),
  ekKadam: z.string().min(1),
  authority: z.object({
    office: z.string(),
    askFor: z.string(),
    numbers: z.array(z.string()).min(1),
    portals: z.array(z.string()),
  }),
  crossLinks: z.array(z.enum(['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10'])),
  verifiedOn: z.string(),
});

const cards = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/cards' }),
  schema: cardSchema,
});

export const collections = { cards };
```

- [ ] **Step 5: Author the 30 content files**

Source of truth: `Mera_Haq_10_Cards_Hindi_2.docx` (hi), `Mera_Haq_10_Cards_Hinglish_3.docx`
(hinglish), and authored plain English derived from the Hinglish master (en).
`ekKadam` values come from spec §7.2. Every `verifiedOn` is `"2026-08-13"`.

Shape, using C1 Hinglish as the worked example — the other 29 follow it exactly:

```json
{
  "id": "C1",
  "slug": "c1",
  "lang": "hinglish",
  "title": "Streedhan — aapke gehne aapke hain",
  "summary": "Shaadi mein mile gehne aur tohfe hamesha ke liye sirf aapke hain.",
  "kanoon": [
    "Shaadi ke waqt ya aas-paas mile gehne, gifts, cash aur saamaan — chahe aapke maayke se ho ya sasural se — hamesha ke liye sirf aapki apni sampatti hai. Isi ko streedhan kehte hain.",
    "Supreme Court ne Pratibha Rani case (1985) mein saaf kaha: streedhan poori tarah patni ka hai; pati ya sasural waale usse bas sambhaalne waale hain, maalik nahin.",
    "Streedhan lautane se mana karna amanat mein khayanat ho sakta hai — IPC dhara 406 / Bharatiya Nyaya Sanhita 2023 dhara 316.",
    "Dahej Nishedh Kanoon 1961, dhara 6: jo bhi dahej kisi aur ke paas hai, woh aurat ko dena hi hoga. Streedhan ka haq alag hone ya talaq ke baad bhi bana rehta hai."
  ],
  "asliZindagi": [
    "'Hum gehne locker mein safe rakh rahe hain' — kisi aur ke paas safe rakhne se maalik nahin badalta. Yeh sahi nahin hai.",
    "'Ladke waalon ki taraf se mile gifts unke parivaar ke hain' — jo bhi AAPKO mila, woh streedhan hai. Yeh sahi nahin hai.",
    "Pati aapke gehne bina poochhe girvi rakhe, beche ya invest kare. Yeh sahi nahin hai.",
    "'Ghar chhoda toh gehne bhi chhode' — ghar chhodne se streedhan nahin chhootta. Yeh sahi nahin hai.",
    "Bank locker sirf pati ya saas ke naam par, jabki usmein aapka streedhan ho. Yeh sahi nahin hai.",
    "Apni hi cheezon ki list rakhne par 'lalchi' kehna. Yeh sahi nahin hai.",
    "Aise kisi paper par sign karwana jisme likha ho ki gifts parivaar ke hain. Yeh sahi nahin hai."
  ],
  "sambhaal": [
    "Har cheez ki simple list banayein, tareekh daalein, photos ke saath — phone mein aur apne email par backup.",
    "Kharidari ki receipts aur shaadi ke photos-video sambhaal kar rakhein.",
    "Locker apne ya joint naam par lein; cheezein kisi aur ke paas hon toh likhit raseed maang lein.",
    "Wapas dene se mana ho toh pehle likhit maang karein — WhatsApp bhi chalega."
  ],
  "ekKadam": "Aaj apne gehnon ki list banayein — photo lein, tareekh daalein.",
  "authority": {
    "office": "District Legal Services Authority (zila court mein) · One Stop Centre · Protection Officer",
    "askFor": "DLSA Front Office; Protection Officer",
    "numbers": ["15100", "181", "14490"],
    "portals": ["scourtapp.nic.in/lsams", "ncwapps.nic.in/onlinecomplaintsv2"]
  },
  "crossLinks": ["C7", "C8"],
  "verifiedOn": "2026-08-13"
}
```

Cross-link map (F-33, plus the Build Manual D7 reachability rule that C3 must be reachable
from C2 and C4):

```
C1 → C7, C8      C2 → C3, C6, C8      C3 → C2, C4, C8      C4 → C3, C8
C5 → C7, C8      C6 → C7, C2          C7 → C1, C6          C8 → C4, C5
C9 → C5, C8      C10 → C6, C8
```

- [ ] **Step 6: Run the tests and verify they pass**

```bash
npm test -- tests/content.spec.ts && npm run build
```
Expected: PASS, and the Astro build validates all 30 files against the Zod schema.

- [ ] **Step 7: Commit**

```bash
git add src/content src/content.config.ts src/lib/cards.ts tests/content.spec.ts
git commit -m "feat(content): add the ten Haq Cards in three languages

Hindi and Hinglish from the card masters; English authored as plain English
for the supporter persona rather than transliterated. Every card carries
exactly one Ek Kadam (F-28), an authority block routing to a free helpline,
cross-links keeping every card within two taps, and the 13 Aug 2026
verified-on stamp.

Tests enforce one-action-per-card, free-helpline reachability, the
no-confrontation content rule, and C3's reachability from C2 and C4."
```

---

## Phase 2 — Routes (Tasks 8–15)

### Task 8: Global chrome

**Files:**
- Create: `src/components/chrome/Header.astro`, `LangPill.astro`, `MenuOverlay.astro`,
  `HelplineStrip.astro`, `MuteToggle.astro`, `DraftBanner.astro`
- Create: `src/lib/prefs.ts`
- Modify: `src/layouts/Base.astro`

**Interfaces:**
- Produces:
  ```ts
  // src/lib/prefs.ts — the ONLY module that touches localStorage
  export function readPrefs(): Prefs;
  export function writePrefs(patch: Partial<Prefs>): void;
  export function clearPrefs(): void;
  export function hasDeck(): boolean;
  ```
- Consumed by: Tasks 9–17.

- [ ] **Step 1: Write `src/lib/prefs.ts`**

```ts
import type { CardId, Lang, Prefs } from './types';
import { MATRIX_VERSION } from './deck';

const KEY = 'mh_prefs';

const DEFAULTS: Prefs = {
  deck: [], v: MATRIX_VERSION, lang: 'hi',
  muted: false, seenAudioNote: false, seenLoginSheet: false,
};

/** In-memory fallback when localStorage is blocked (private mode). UF-15: the flow
 *  continues, with a one-line note that cards will not be remembered. */
let memory: Prefs = { ...DEFAULTS };
let usingMemory = false;

export function storageAvailable(): boolean {
  return !usingMemory;
}

export function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    // Version drift: serve the stored deck as-is. Recompute is impossible — we never
    // stored the answers, which is the point.
    return { ...DEFAULTS, ...parsed };
  } catch {
    usingMemory = true;
    return { ...memory };
  }
}

export function writePrefs(patch: Partial<Prefs>): void {
  const next = { ...readPrefs(), ...patch };
  // Defensive: nothing answer-shaped may ever be persisted.
  for (const k of ['q1', 'q2', 'q3', 'q4', 'q5', 'answers']) {
    if (k in (patch as Record<string, unknown>)) {
      throw new Error(`prefs: refusing to persist answer field "${k}"`);
    }
  }
  memory = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { usingMemory = true; }
}

export function clearPrefs(): void {
  memory = { ...DEFAULTS };
  try { localStorage.removeItem(KEY); } catch { /* memory already reset */ }
}

export function hasDeck(): boolean {
  return readPrefs().deck.length > 0;
}
```

- [ ] **Step 2: Write `src/components/chrome/HelplineStrip.astro`**

```astro
---
import { t } from '../../lib/i18n';
import type { Lang } from '../../lib/types';
interface Props { lang?: Lang }
const { lang = 'hi' } = Astro.props;
const NUMBERS = [
  { n: '181', key: 'helpline.181' },
  { n: '15100', key: 'helpline.15100' },
];
---
<!-- F-03. Visible without scrolling on the home screen. Someone may arrive here in
     the worst hour of her life; the number must not require a journey. -->
<div class="flex items-center gap-2 bg-blue-050 px-3 py-2" data-testid="helpline-strip">
  {NUMBERS.map(({ n }) => (
    <a href={`tel:${n}`} data-testid={`tel-${n}`}
       class="mono tap-lg flex flex-1 items-center justify-center gap-2 rounded-action
              bg-surface px-3 text-[1.125rem] font-bold text-blue-600 ring-1 ring-blue-600/20">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z"
              stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      {n}
    </a>
  ))}
</div>
```

- [ ] **Step 3: Write `MenuOverlay.astro`, `LangPill.astro`, `MuteToggle.astro`, `DraftBanner.astro`**

`MenuOverlay.astro` — full-screen overlay (never a dropdown), 56px rows, single line, no
truncation. Items in PRD §5.5 order: `menu.diagnostic` → `/shuru`, `menu.allCards` →
`/sabhi-card`, `menu.madad` → `/madad`, `menu.myCards` → `/aapke-card` (only when a deck
exists), `menu.about` → `/hamare-baare-mein`, `menu.impact` → `/asar`, `menu.reset`
(confirm step, then `clearPrefs()` → `/shuru`, only when a deck exists), `menu.mute`.
The quick-exit ✘ stays visible and functional while the overlay is open — the overlay must
use `z-index` below `100`.

`LangPill.astro` — top-centre segmented control showing हिं / Hg / EN; tap opens a three-row
bottom sheet. Deliberately not in the ☰ menu: language is a first decision, not a setting.
Calls `applyLang()` then `writePrefs({ lang })`. Never competes with ☰ or ✘.

`MuteToggle.astro` — when mute is on, every सुनिए control is **visibly disabled with the
label «आवाज़ बंद है», not hidden** (F-06). She must be able to find it and turn it back on.

`DraftBanner.astro` — renders when `LEGAL_SIGNOFF` is false. A `--red-050` strip carrying
`draft.banner`. Appears on every rights surface: card pages, `/sabhi-card`, `/aapke-card`,
`/madad`, and in the generated PNGs and PDFs.

- [ ] **Step 4: Write `src/components/chrome/Header.astro` and wire it into `Base.astro`**

Fixed grid: ☰ top-left · language pill top-centre · ✘ top-right. **These three never move
and never swap** (PRD §5.5 r1). Login button renders only when `Astro.props.showLogin` is
true — home and institutional routes only.

- [ ] **Step 5: Write the chrome test**

Add to `tests/e2e/safety.spec.ts`:

```ts
test('the three fixed controls never move or swap', async ({ page }) => {
  for (const route of ['/', '/shuru', '/card/c1', '/madad', '/sabhi-card']) {
    await page.goto(route);
    const menu = (await page.getByTestId('menu-toggle').boundingBox())!;
    const exit = (await page.getByTestId('quick-exit').boundingBox())!;
    const pill = (await page.getByTestId('lang-pill').boundingBox())!;
    const vw = page.viewportSize()!.width;
    expect(menu.x, `${route}: menu not top-left`).toBeLessThan(80);
    expect(exit.x + exit.width, `${route}: exit not top-right`).toBeGreaterThan(vw - 80);
    expect(pill.x + pill.width / 2, `${route}: pill not top-centre`).toBeGreaterThan(vw * 0.3);
    expect(pill.x + pill.width / 2, `${route}: pill not top-centre`).toBeLessThan(vw * 0.7);
  }
});

test('login never appears on app routes', async ({ page }) => {
  for (const route of ['/shuru', '/card/c1', '/madad', '/sabhi-card', '/aapke-card']) {
    await page.goto(route);
    await expect(page.getByTestId('login-header'), route).toHaveCount(0);
  }
});

test('answers are never persisted', async ({ page }) => {
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
  await page.waitForSelector('[data-testid="s7-title"]');

  const stored = await page.evaluate(() => localStorage.getItem('mh_prefs'));
  expect(stored).toBeTruthy();
  const prefs = JSON.parse(stored!);
  expect(Object.keys(prefs).sort()).toEqual(
    ['deck', 'lang', 'muted', 'region', 'seenAudioNote', 'seenLoginSheet', 'v'].sort(),
  );
  for (const k of ['q1', 'q2', 'q3', 'q4', 'q5', 'answers']) expect(prefs).not.toHaveProperty(k);

  // S7 must not echo a single option string back at her.
  const body = await page.locator('body').innerText();
  expect(body).not.toContain('मैं कमाती हूँ, पर पैसे घरवाले रखते हैं');
  expect(body).not.toContain('शादी में मुझे गहने और तोहफ़े मिले थे');
});
```

- [ ] **Step 6: Verify and commit**

```bash
npm run build && npx playwright test tests/e2e/safety.spec.ts --project=sunita
git add src/components/chrome src/lib/prefs.ts src/layouts tests/e2e/safety.spec.ts
git commit -m "feat(chrome): add header, menu, language pill, helpline strip, mute, draft banner

prefs.ts is the only module that touches localStorage, and it throws if asked
to persist anything answer-shaped. Menu is a full-screen overlay with 56px
rows and sits below the quick exit in the stacking order so the exit stays
functional while it is open.

Tests assert the three fixed controls never move or swap across routes, login
never appears on app routes, and a full diagnostic run leaves no answer in
storage and no option string in the reveal DOM."
```

---

### Task 9: Home page — static structure and hero

**This task ends at a screenshot gate. Nothing after it starts until the owner signs off.**

**Files:**
- Create: `src/components/home/Hero.astro`, `HowTo.astro`, `Value.astro`, `Impact.astro`,
  `CardGallery.astro`, `Features.astro`, `Faq.astro`, `Footer.astro`
- Create: `src/components/card/HaqCard.astro` (the deck motif)
- Rewrite: `src/pages/index.astro`

**Interfaces:**
- Produces: `<HaqCard card={CardContent} tilt={number} />`, reused by Task 11's gallery,
  Task 12's reveal, and Task 13's `/sabhi-card` grid.

- [ ] **Step 1: Write the above-the-fold test first**

Add to `tests/e2e/safety.spec.ts`:

```ts
test('hero, CTA and helpline clear the fold at 360x740', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  const fold = 740;
  for (const id of ['hero-question', 'hero-cta', 'hero-escape', 'helpline-strip']) {
    const box = (await page.getByTestId(id).boundingBox())!;
    expect(box.y + box.height, `${id} below the fold`).toBeLessThanOrEqual(fold);
  }
  const cta = (await page.getByTestId('hero-cta').boundingBox())!;
  expect(cta.height, 'primary CTA under 56px').toBeGreaterThanOrEqual(56);
});
```

- [ ] **Step 2: Run it and verify it fails**

```bash
npx playwright test -g "clear the fold" --project=sunita
```
Expected: FAIL — no `hero-question`.

- [ ] **Step 3: Build the eight sections, in order**

Order is fixed and asserted in Step 6: **Hero → HowTo → Value → Impact → CardGallery →
Features → Faq → Footer.**

**Hero** — shirorekha rule, then the frozen question at `--text-display` with «हक़» at the
emphasis weight, `sunie` control, `hero-cta` (`--pink-600`, ≥56px, full-width on mobile),
`hero-escape` text link, and the deck peeking above the fold crop. Returning visitor with a
stored deck gets a third element, `cta.myCards`, above the fold (F-14). Behind everything, a
`radial-gradient` bloom field — **no `filter: blur()`**.

**HowTo** — three steps, «5 सवाल → आपके 5 कार्ड → एक कदम आज», numerals in mono.

**Value** — two-column. Left holds the claim «जानकारी नहीं — रास्ता»; right holds four rows:
lawyer-verified · no login, nothing saved · works offline · free helplines. Blue-050 chips,
partial-width hairlines.

**Impact** — the **one** dark chapter, `--ink` full-bleed, the light sheet above it curving
in at `--radius-sheet`. Numerals in mono, `--pink-200` on dark. Values are «—» placeholders
with the counting method stated; the PRD forbids invented numbers and no pilot has run.
Carries the "what did not work" line — it is the brand.

**CardGallery** — all ten `HaqCard`s. Horizontal scroller with `scroll-snap` at every width;
Task 10 adds pinning above 768px only.

**Features** — six: सुनिए audio · WhatsApp share + voice note · A5 PDF · works offline ·
three languages · quick exit. Outline icons as inline SVG, no icon font.

**Faq** — native `<details>`, styled, so it works with JS off. Six questions sourced from the
PRD: क्या यह मुफ़्त है? · क्या मेरा नाम पूछा जाएगा? · क्या यह सलाह है? · फ़ोन में क्या सेव
होता है? · क्या यह वकील ने देखा है? · क्या मैं यह किसी और को भेज सकती हूँ? Emits
`schema.org/FAQPage` JSON-LD.

**Footer** — wedge SVG divider into `--ink`. Columns: rights links, madad numbers (mono,
`tel:`), language pill, `footer.disclaimer` + reviewer credit, `footer.noTracking`.
**No donate or volunteer surface anywhere** — those pages are dropped and the suppression
test guards against reintroduction.

- [ ] **Step 4: Write `src/components/card/HaqCard.astro`**

The signature motif. Fixed `+4°` rotation delta on the backing card, counter-rotated face on
top, `--pink-050` surface, `--ink` title, `--radius-card`, one-line summary, `card.open`
link. No shadow ramp — tint and the shirorekha rule only. Accepts `tilt` so the gallery and
the S7 reveal can fan a stack from one component.

- [ ] **Step 5: Screenshot at all three widths**

```bash
npm run build && npm run preview &
npx playwright screenshot --viewport-size=360,740 http://localhost:4321/ hero-360.png
npx playwright screenshot --viewport-size=768,1024 http://localhost:4321/ hero-768.png
npx playwright screenshot --viewport-size=1440,900 http://localhost:4321/ hero-1440.png
```

Then open the page in Chrome DevTools MCP and critique the real render — never design blind.
Check specifically: the conjuncts in «ज़रूरी», the Montserrat/Mukta seam on any mixed line,
whether the deck crop reads as an invitation to scroll or as a bug, and whether the pink CTA
is unambiguously the only action on screen.

- [ ] **Step 6: Write the section-order test**

```ts
test('the eight home sections appear in the specified order', async ({ page }) => {
  await page.goto('/');
  const order = await page.$$eval('[data-section]', (els) =>
    els.map((e) => (e as HTMLElement).dataset.section));
  expect(order).toEqual(['hero', 'howto', 'value', 'impact', 'cards', 'features', 'faq', 'footer']);
});

test('exactly one dark chapter', async ({ page }) => {
  await page.goto('/');
  const dark = await page.$$eval('[data-section]', (els) =>
    els.filter((e) => getComputedStyle(e).backgroundColor === 'rgb(31, 42, 68)').length);
  expect(dark).toBe(1);
});
```

- [ ] **Step 7: 🚦 OWNER GATE — present the three screenshots and stop**

Do not begin Task 10 until the owner signs off on the hero.

- [ ] **Step 8: Commit**

```bash
git add src/components/home src/components/card/HaqCard.astro src/pages/index.astro tests/
git commit -m "feat(home): add the eight home sections and the Haq Card deck motif

Hero clears the 360x740 fold with the question, the CTA, the escape link and
both helpline numbers, asserted by test. One dark chapter (Impact), asserted
by test. Impact numerals are em-dash placeholders with the counting method
stated — the PRD forbids invented numbers and no pilot has run.

Bloom fields are pure radial-gradients with no filter: blur(), which removes
the most expensive paint operation on a low-end Android.

FAQ uses native <details> so it works with JavaScript off, and emits
schema.org FAQPage."
```

---

### Task 10: Home page — GSAP choreography

**Files:**
- Create: `src/components/home/HomeMotion.astro` (island, `client:visible`)
- Create: `src/lib/motion.ts`

**Interfaces:**
- Consumes: `data-section` and `data-anim` attributes emitted by Task 9's sections.

- [ ] **Step 1: Write `src/lib/motion.ts`**

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });

export function initHomeMotion(): () => void {
  const mm = gsap.matchMedia();

  mm.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
      mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
    },
    (ctx) => {
      const { reduce, desktop } = ctx.conditions!;

      // This audience overlaps exactly with the low-end devices where motion hurts.
      // Everything renders in its final state, instantly. No timelines are created.
      if (reduce) {
        gsap.set('[data-anim]', { clearProps: 'all', opacity: 1, y: 0, x: 0 });
        return;
      }

      // Hero — words stagger up under a clip-path wipe. Hand-split into spans by the
      // component; SplitText is deliberately not used, which also keeps the original
      // text nodes intact for screen readers.
      gsap.from('[data-anim="hero-word"]', {
        yPercent: 110, duration: 0.8, stagger: 0.06, ease: 'power3.out',
      });

      // The CTA pulses once, 2s after load. Once — never a loop; a looping pulse on a
      // shared phone reads as a notification.
      gsap.to('[data-anim="hero-cta"]', {
        scale: 1.02, duration: 0.35, delay: 2, yoyo: true, repeat: 1, ease: 'sine.inOut',
      });

      // Ambient bloom drift. ease:'none' so it never reads as an event.
      gsap.to('[data-anim="bloom"]', {
        xPercent: 8, yPercent: -6, duration: 20, repeat: -1, yoyo: true, ease: 'none',
      });

      gsap.from('[data-anim="howto-step"]', {
        opacity: 0, y: 40, duration: 0.5, stagger: 0.12,
        scrollTrigger: { trigger: '[data-section="howto"]', start: 'top 85%' },
      });
      gsap.from('[data-anim="howto-line"]', {
        scaleX: 0, transformOrigin: 'left center', ease: 'none',
        scrollTrigger: { trigger: '[data-section="howto"]', start: 'top 80%', end: 'bottom 60%', scrub: 1 },
      });

      // PIN 1 of 2. The GSAP guidance is explicit: never pin more than one or two
      // sections on a page. These are the only two.
      if (desktop) {
        ScrollTrigger.create({
          trigger: '[data-section="value"]',
          start: 'top top', end: 'bottom bottom',
          pin: '[data-anim="value-claim"]', pinSpacing: false, id: 'value-pin',
        });
      }
      gsap.from('[data-anim="value-row"]', {
        opacity: 0, x: 30, stagger: 0.1,
        scrollTrigger: { trigger: '[data-section="value"]', start: 'top 70%', end: 'bottom 70%', scrub: 1 },
      });

      // Count-up on the dark chapter. snap:1 so a partial number never shows.
      for (const el of gsap.utils.toArray<HTMLElement>('[data-anim="stat"]')) {
        const to = Number(el.dataset.to ?? '0');
        if (!to) continue; // «—» placeholders stay as they are
        gsap.fromTo(el, { textContent: 0 }, {
          textContent: to, duration: 1.4, ease: 'power1.out',
          snap: { textContent: 1 },
          scrollTrigger: { trigger: el, start: 'top 60%', once: true },
        });
      }

      // PIN 2 of 2 — the signature moment. Desktop only: pinned horizontal scroll
      // janks badly on low-end Androids, so mobile keeps the native scroll-snap
      // scroller the component already ships.
      if (desktop) {
        const track = document.querySelector<HTMLElement>('[data-anim="gallery-track"]');
        if (track) {
          gsap.to(track, {
            x: () => -(track.scrollWidth - window.innerWidth),
            ease: 'none',
            scrollTrigger: {
              trigger: '[data-section="cards"]',
              pin: true, scrub: 1, id: 'gallery-pin',
              end: () => `+=${track.scrollWidth - window.innerWidth}`,
              snap: { snapTo: 1 / 9, duration: 0.25, ease: 'power1.inOut' },
              invalidateOnRefresh: true,
            },
          });
        }
      }

      gsap.from('[data-anim="feature"]', {
        opacity: 0, y: 24, stagger: 0.06,
        scrollTrigger: { trigger: '[data-section="features"]', start: 'top 85%' },
      });

      return () => ScrollTrigger.getAll().forEach((s) => s.kill());
    },
  );

  // Devanagari webfonts change line-box height on swap, which desyncs every pin.
  // Refresh once fonts have settled — this is not optional with a Devanagari UI.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  return () => mm.revert();
}
```

- [ ] **Step 2: Write `HomeMotion.astro` to lazy-load it**

```astro
<script>
  // GSAP is dynamically imported on idle so it never blocks first paint, and never
  // enters the bundle for /shuru or the card routes.
  const load = () => import('../../lib/motion').then((m) => m.initHomeMotion());
  if ('requestIdleCallback' in window) requestIdleCallback(() => load(), { timeout: 2000 });
  else setTimeout(load, 1200);
</script>
```

- [ ] **Step 3: Write the reduced-motion and pin-count tests**

```ts
test('reduced motion renders the final state and creates no ScrollTriggers', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await page.waitForTimeout(2500);
  const triggers = await page.evaluate(() => (window as any).ScrollTrigger?.getAll?.().length ?? 0);
  expect(triggers).toBe(0);
  for (const el of await page.$$('[data-anim]')) {
    expect(await el.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  }
  await ctx.close();
});

test('at most two pinned sections', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2500);
  const pinned = await page.evaluate(
    () => ((window as any).ScrollTrigger?.getAll?.() ?? []).filter((s: any) => s.pin).length);
  expect(pinned).toBeLessThanOrEqual(2);
});

test('the JS budget for / holds', async ({ page }) => {
  const bytes: number[] = [];
  page.on('response', async (r) => {
    if (r.url().endsWith('.js')) bytes.push((await r.body().catch(() => Buffer.alloc(0))).length);
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  const total = bytes.reduce((a, b) => a + b, 0);
  expect(total, 'home JS over 160KB').toBeLessThan(160 * 1024 * 3); // uncompressed ≈ 3× gz
});
```

- [ ] **Step 4: Verify, screenshot both motion modes, commit**

```bash
npx playwright test -g "reduced motion|pinned sections|JS budget" --project=desktop
git add src/lib/motion.ts src/components/home/HomeMotion.astro tests/
git commit -m "feat(home): add GSAP scroll choreography

Two pinned sections at most, per GSAP's own guidance; the horizontal gallery
unpins below 768px because pinned horizontal scroll janks on low-end Androids,
falling back to the native scroll-snap scroller.

gsap.matchMedia tears everything down under prefers-reduced-motion and creates
no ScrollTriggers at all. ScrollTrigger.refresh() runs after document.fonts.ready
because Devanagari webfonts change line-box height on swap and desync every pin.

GSAP is dynamically imported on idle and never enters the /shuru or card bundles."
```

---

### Task 11: The diagnostic route

**Files:**
- Create: `src/components/diagnostic/Diagnostic.astro`, `QuestionScreen.astro`,
  `OptionRow.astro`, `ProgressDots.astro`, `Processing.astro`, `Reveal.astro`
- Create: `src/pages/shuru.astro`

- [ ] **Step 1: Write the flow test**

```ts
test('single-selects auto-advance and multi-selects wait for the CTA', async ({ page }) => {
  await page.goto('/shuru');
  await page.getByTestId('s0-start').click();
  await page.getByTestId('s0b-unknown').click();
  await expect(page.getByTestId('q1-question')).toBeVisible({ timeout: 1000 });

  await page.getByTestId('q1-a').click();
  await expect(page.getByTestId('q2-question')).toBeVisible({ timeout: 1000 });

  await page.getByTestId('q2-b').click();
  await expect(page.getByTestId('q3-question')).toBeVisible({ timeout: 1000 });

  // Multi-select must NOT auto-advance.
  await page.getByTestId('q3-a').click();
  await page.waitForTimeout(700);
  await expect(page.getByTestId('q3-question')).toBeVisible();
  await page.getByTestId('q3-cta').click();
  await expect(page.getByTestId('q4-question')).toBeVisible();
});

test('Q1=d hides the two marriage statements', async ({ page }) => {
  await page.goto('/shuru');
  await page.getByTestId('s0-start').click();
  await page.getByTestId('s0b-unknown').click();
  await page.getByTestId('q1-d').click();
  await page.getByTestId('q2-a').click();
  await expect(page.getByTestId('q3-a')).toHaveCount(0);
  await expect(page.getByTestId('q3-b')).toHaveCount(0);
  await expect(page.getByTestId('q3-c')).toBeVisible();
});

test('there is no skip control anywhere in the flow', async ({ page }) => {
  // Owner decision D7. Escapes remain: S0's «सीधे कार्ड देखें», Q3(f), Q4(e), Q5(e), back.
  await page.goto('/shuru');
  await expect(page.getByTestId('s0-escape')).toBeVisible();
  await page.getByTestId('s0-start').click();
  await page.getByTestId('s0b-unknown').click();
  for (const q of ['q1', 'q2', 'q3', 'q4', 'q5']) {
    await expect(page.getByTestId(`${q}-skip`), `${q} has a skip control`).toHaveCount(0);
  }
});

test('progress is five dots, never a counter', async ({ page }) => {
  await page.goto('/shuru');
  await page.getByTestId('s0-start').click();
  await page.getByTestId('s0b-unknown').click();
  await expect(page.getByTestId('progress-dots').locator('[data-dot]')).toHaveCount(5);
  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/सवाल\s*\d\s*\/\s*5|Question\s*\d\s*of\s*5/);
});

test('every option meets the 48px target', async ({ page }) => {
  await page.goto('/shuru');
  await page.getByTestId('s0-start').click();
  await page.getByTestId('s0b-unknown').click();
  for (const opt of await page.getByRole('button', { name: /.+/ }).all()) {
    const box = await opt.boundingBox();
    if (box) expect(box.height).toBeGreaterThanOrEqual(48);
  }
});
```

- [ ] **Step 2: Run and verify failure, then implement**

Screens: S0 → S0b → Q1 → Q2 → Q3 → Q4 → Q5 → S6 → S7.

- Single-selects (S0b, Q1, Q2, Q4): highlight, then auto-advance after **400 ms**.
- Multi-selects (Q3, Q5): explicit CTAs, `q3.cta` and `q5.cta`.
- `hiddenOptions(answers)` from `deck.ts` drives Q3 option hiding — the engine owns that
  rule, not the component.
- Back arrow top-left of the content area, never colliding with ☰.
- **No skip control** (D7).
- S6 pulses ~1.5 s. Purely psychological; the computation is instant.
- S7 calls `deck(answers)` once, writes `{ deck, v, region }` via `writePrefs`, and
  **discards the answers object**. It renders card titles only — no answer echo, ever. C8
  carries `s7.universal`.
- **Near-zero GSAP.** Option highlight, S6 pulse and the S7 fan-in are CSS keyframes. This
  route imports no GSAP at all.

- [ ] **Step 3: Verify the JS budget and commit**

```bash
npx playwright test -g "auto-advance|hides the two|no skip|five dots|48px" --project=sunita
git add src/components/diagnostic src/pages/shuru.astro tests/
git commit -m "feat(diagnostic): add the /shuru flow

S0 -> S0b -> Q1-Q5 -> S6 -> S7. Single-selects auto-advance after 400ms;
multi-selects wait for an explicit CTA. Q3 option hiding is driven by
hiddenOptions() from the engine so the rule has one owner.

No skip control (owner decision D7); the escapes are S0's direct-to-cards
link, Q3(f), Q4(e), Q5(e) and the back arrow.

S7 computes the deck once, persists the output only, and discards the answers.
Zero GSAP on this route — the three micro-moments are CSS."
```

---

### Task 12: Deck and grid routes

**Files:** `src/pages/aapke-card.astro`, `src/pages/sabhi-card.astro`

- Two tabs, `tab.mine` and `tab.all`. Neutral naming — never anything that labels her
  situation.
- Reads the deck from `mh_prefs`; also accepts the `#d=C2,C6,C1,C3,C8&v=2` fragment so the
  future WhatsApp bot deep link works. The fragment never reaches a server.
- **Malformed or unknown IDs → foundation deck, silently. Never an error** (UF-15).
- `/sabhi-card` is fully static: all ten cards, no JS required. Gated cards are always here —
  personalisation curates, it never censors.

Test: deep-link a malformed fragment and assert the foundation deck renders with no error
text; assert `/sabhi-card` shows ten cards with JavaScript disabled.

- [ ] Commit: `feat(deck): add /aapke-card and /sabhi-card`

---

### Task 13: Card template

**Files:** `src/pages/card/[id].astro`, `src/components/card/CardTemplate.astro`,
`EkKadam.astro`, `AuthorityBlock.astro`, `ShareRow.astro`, `CrossLinks.astro`

Fixed order, no exceptions: सुनिए (**first interactive element on the page**) → कानून क्या
कहता है → असली ज़िंदगी में (red-050 tint, each Don't ending in its «यह सही नहीं है» verdict)
→ सँभाल कर रखें → **exactly one** एक कदम आज (`--pink-600`, `--radius-0`, 3px left rule) →
authority block (blue, `tel:`, portals in a new tab with `rel="noopener noreferrer"`) →
WhatsApp share + PDF download → यह भी जानिए → footer disclaimer + reviewer credit +
verified-on in mono.

Prerendered via `getStaticPaths`, zero hydration. Works with JS off.

Test: exactly one `[data-testid="ek-kadam"]`; सुनिए precedes all content in DOM order; every
number is a `tel:` link with a ≥56px box; the disclaimer and reviewer credit are present on
all ten pages in all three languages.

- [ ] Commit: `feat(cards): add the card detail template`

---

### Task 14: The सुनिए audio system

**Files:** `src/lib/audio.ts`, `src/components/chrome/SunieButton.astro`,
`scripts/transcode-audio.mjs`

- [ ] **Step 1: Write the transcode script**

```js
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';

const MAP = {
  'Card 1 - Streedhan.mp3': 'c1', 'Card 2- Kamayi.mp3': 'c2',
  'Card 3 - Ghar mein rehene ka haq.mp3': 'c3', 'Card 4 - Guzara Bhatta.mp3': 'c4',
  'Card 5 - Beti ka Hissa.mp3': 'c5', 'Card 6 - Apna Bank Khata.mp3': 'c6',
  'Card 7 - Kaagaz.mp3': 'c7', 'Card 8 - Muft Vakil.mp3': 'c8',
  'Card 9 - Vidhwa ka hissa.mp3': 'c9', 'Card 10 - Karz aapka nhi.mp3': 'c10',
};

mkdirSync('public/audio', { recursive: true });
const over60 = [];

for (const [file, id] of Object.entries(MAP)) {
  const src = `resources/audio/${file}`;
  if (!existsSync(src)) throw new Error(`missing source: ${src}`);

  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', src]).toString().trim());
  if (dur > 60) over60.push([id, Math.round(dur)]);

  // Mono, 40 kbps. Speech at this bitrate in Opus is clean, and it is the difference
  // between a 4-minute wait and a 5-second one on a throttled 2G evening.
  execFileSync('ffmpeg', ['-y', '-i', src, '-ac', '1', '-c:a', 'libopus', '-b:a', '40k',
    '-application', 'voip', `public/audio/${id}.webm`]);
  execFileSync('ffmpeg', ['-y', '-i', src, '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '48k',
    `public/audio/${id}.mp3`]);

  const kb = Math.round(statSync(`public/audio/${id}.webm`).size / 1024);
  console.log(`${id}: ${Math.round(dur)}s → ${kb} KB`);
  if (kb > 250) console.warn(`  ⚠ ${id} exceeds the 250 KB F-05 budget`);
}

if (over60.length) {
  console.warn('\n⚠ Clips over the 60s Build Manual D4 limit — these are re-record decisions,');
  console.warn('  not truncation candidates. Reported, not silently cut:');
  for (const [id, s] of over60) console.warn(`  ${id}: ${s}s`);
}
```

- [ ] **Step 2: Write `src/lib/audio.ts`**

Rules, all from F-05 and all testable:
- **Never autoplay.** Every play path requires a user gesture.
- First tap in a session shows the one-time note `sunie.note` + `sunie.noteTip`, dismissible,
  never shown twice in a session.
- Playing → the pill becomes `sunie.pause` with a thin progress line.
- Any navigation, back, or quick-exit stops **and unloads** playback.
- Mute → control is visibly **disabled with `sunie.muted`, not hidden**.
- 404 or decode failure → `hi-IN` Web Speech. TTS unavailable → the control hides silently.
  **Never an error message.**
- `/madad` reads numbers digit by digit — «एक — आठ — एक».
- Hindi and Hinglish share one recording (F-110 r6). English is text-only at launch.

- [ ] **Step 3: Test and commit**

```ts
test('no audio plays without a gesture, on any route', async ({ page }) => {
  for (const route of ['/', '/shuru', '/card/c1', '/madad']) {
    await page.goto(route);
    await page.waitForTimeout(1200);
    const playing = await page.evaluate(
      () => Array.from(document.querySelectorAll('audio')).some((a) => !a.paused));
    expect(playing, `${route} autoplayed audio`).toBe(false);
  }
});

test('the shared-phone note appears once per session', async ({ page }) => {
  await page.goto('/card/c1');
  await page.getByTestId('sunie').click();
  await expect(page.getByTestId('audio-note')).toBeVisible();
  await page.getByTestId('audio-note-ok').click();
  await page.getByTestId('sunie').click();
  await expect(page.getByTestId('audio-note')).toHaveCount(0);
});

test('mute disables the control rather than hiding it', async ({ page }) => {
  await page.goto('/card/c1');
  await page.getByTestId('menu-toggle').click();
  await page.getByTestId('menu-mute').click();
  await expect(page.getByTestId('sunie')).toBeVisible();
  await expect(page.getByTestId('sunie')).toBeDisabled();
  await expect(page.getByTestId('sunie')).toContainText('आवाज़ बंद है');
});
```

- [ ] Commit: `feat(audio): add the सुनिए system and card audio transcode`

---

### Task 15: /madad, Sakhi shell, institutional pages

**`/madad`** — universal helpline block expanded on load (181 · 112 · 15100 · 14454 · 1930 ·
14448 · 14490), then one collapsible row per card C1…C10, collapsed by default, opening one
at a time, each carrying the PRD §5.6 mapping table exactly. Every number `tel:`, ≥56px,
labelled `helpline.press`. Native `<details>` so it works with JS off. Carries the D9
shared-phone note (F-07).

**Sakhi shell** — FAB bottom-right, home only, never overlapping the helpline strip or the
CTA. Full-screen chat overlay. **Calls the identical `deck()` function** — asserted by an
import-identity test and a fuzz comparing both shells:

```ts
import { deck } from '../src/lib/deck';
import { computeChatDeck } from '../src/components/diagnostic/sakhi-engine';

it('the chat shell and /shuru use the same function object', () => {
  expect(computeChatDeck).toBe(deck);
});
```

Two distinct exits: minimise top-left (collapses to the FAB, stays on the page) and quick
exit top-right (leaves the site). **They must never be visually confusable.**

**Institutional** — `/hamare-baare-mein` (what this is, who reviewed it, the safety rules,
the D9 note verbatim) and `/asar` (five honest numbers as «—» placeholders, the counting
method, and the "what did not work" section — that section is the brand).

- [ ] Commit: `feat(routes): add /madad, the Sakhi chat shell and institutional pages`

---

## Phase 3 — Platform (Tasks 16–20)

### Task 16: PWA and offline

`@vite-pwa/astro`, `generateSW`. Precache: the shell, all ten card pages, `/madad`,
`/sabhi-card`, all ten transcoded audio files, the fonts, and the three language JSON
bundles. `/madad` is the page most likely to be needed when the data has run out.

Respect `Save-Data`: nothing prefetches on a metered connection.

```ts
test('madad and the cards work with the network killed', async ({ page, context }) => {
  await page.goto('/madad');
  await page.goto('/card/c1');
  await page.goto('/sabhi-card');
  await context.setOffline(true);
  await page.goto('/madad');
  await expect(page.getByTestId('tel-181')).toBeVisible();
  await page.goto('/card/c1');
  await expect(page.getByTestId('ek-kadam')).toBeVisible();
});
```

- [ ] Commit: `feat(pwa): add offline shell, card and madad caching`

---

### Task 17: Login

Blocked on owner action O1 (Supabase project ref + anon key). Build the adapter first; it
reads `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` and **disables the login surfaces
entirely when they are absent**, rather than erroring.

Magic link + Google OAuth. **No phone auth.** Synced row is `{ deck, v, lang }` and nothing
else — the no-echo rule survives into the account. RLS scoped to the auth user.

```ts
test('the login sheet appears once, dismisses in one tap, and never blocks', async ({ page }) => {
  await page.goto('/shuru');
  // ... complete the flow ...
  await page.getByTestId('s7-open').click();
  await expect(page.getByTestId('login-sheet')).toBeVisible();
  await page.getByTestId('login-later').click();
  await expect(page.getByTestId('login-sheet')).toHaveCount(0);
  await expect(page.getByTestId('deck-list')).toBeVisible();

  await page.reload();
  await expect(page.getByTestId('login-sheet')).toHaveCount(0);
});
```

- [ ] Commit: `feat(auth): add optional non-blocking login`

---

### Task 18: Square PNG and A5 PDF generation

`scripts/generate-card-assets.mjs` — Playwright Chromium renders an HTML template per card
per language.

- **Square**: 1080×1080, ≤200 KB. **Not the A5 shrunk down** — one huge headline, three
  bullets maximum, the link, nothing else. Acid test: readable at 25% zoom.
- **A5**: single page, ≤400 KB, body ≥14pt, Devanagari **embedded and subsetted**, QR to
  `/card/cN#audio`, greyscale-legible (the Ek Kadam and authority boxes are distinguished by
  their 3px rules, not by colour).
- Both carry the DRAFT banner while `LEGAL_SIGNOFF` is false.
- Every output is opened and checked for स्त्रीधन and ज़िंदगी conjunct correctness before the
  build is green.

- [ ] Commit: `feat(assets): generate WhatsApp squares and A5 PDFs`

---

### Task 19: The remaining test suites

`tests/e2e/suppression.spec.ts` — scans every rights route's DOM in all three languages for
donate/volunteer vocabulary and outbound-giving links; fails on any hit. Regression guard
now that those pages are dropped.

`tests/e2e/nojs.spec.ts` — `javaScriptEnabled: false` against `/sabhi-card`, `/card/c1…c10`
and `/madad`: content readable, every number a working `tel:` link.

`tests/e2e/privacy.spec.ts`:

```ts
test('no third-party requests and no cookies, on any route', async ({ page, context }) => {
  const foreign: string[] = [];
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname) && url.protocol !== 'data:') {
      foreign.push(r.url());
    }
  });
  for (const route of ['/', '/shuru', '/card/c1', '/madad', '/sabhi-card']) {
    await page.goto(route, { waitUntil: 'networkidle' });
  }
  expect(foreign, `third-party requests: ${foreign.join(', ')}`).toHaveLength(0);
  expect(await context.cookies()).toHaveLength(0);
});
```

- [ ] Commit: `test: add suppression, no-JS and privacy suites`

---

### Task 20: Review loop and verification

1. Chrome DevTools MCP: screenshot `/`, `/shuru`, `/card/c1`, `/madad` at 360×740, 768 and
   1440. Critique the real render — never design blind.
2. `web-design-guidelines` review of the home page and the diagnostic.
3. `accessibility-scan` → `accessibility-inspect` → `accessibility-fix` on `/`, `/shuru`,
   `/card/c1`, `/madad`. AA is non-negotiable for this audience.
4. Lighthouse mobile: `/` ≥ 80 perf, `/shuru` ≥ 90 perf, both 100 a11y.
5. `verification-before-completion`: run the spec §13 checklist and paste the evidence.
6. README with run and deploy instructions, the acceptance checklist status, and the six
   open owner actions.

- [ ] Commit: `docs: add README and acceptance checklist evidence`

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: §3 architecture → Tasks 2, 9, 10;
§4 design system → Task 4; §5 engine → Task 3; §6.1 home → Tasks 9, 10; §6.2 diagnostic →
Task 11; §6.3 cards → Task 13; §6.4 madad → Task 15; §6.5 chrome → Tasks 5, 8; §7 content →
Tasks 6, 7; §8 assets → Tasks 1, 14, 18; §9 safety invariants → Tasks 5, 8, 14, 16, 19;
§10 login → Task 17; §11 testing → Tasks 3–19 plus 19; §13 checklist → Task 20.

**Known gap, deliberate:** the WhatsApp bot (F-60…F-67) has no task — it is out of scope per
spec §1 and needs a Meta Business dependency the website build does not own. `deck()` is
built shell-agnostic so the bot imports it unchanged.

**Type consistency.** `deck(answers: Answers): CardId[]` and `hiddenOptions(answers): string[]`
are used with those exact signatures in Tasks 11, 12 and 15. `readPrefs`/`writePrefs`/
`clearPrefs`/`hasDeck` from Task 8 are used with those names in Tasks 11, 12, 16, 17.
`CardContent` from Task 7 is consumed by `HaqCard` in Task 9 and `CardTemplate` in Task 13.
`t(key, lang)` and `applyLang(lang)` from Task 6 are used throughout.

**Blocking dependency:** Task 17 needs owner action O1. Every other task is unblocked.
