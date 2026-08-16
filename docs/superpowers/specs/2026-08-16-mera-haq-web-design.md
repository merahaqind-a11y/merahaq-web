# Mera Haq — Web Platform Design Spec

**Date:** 16 August 2026
**Status:** Approved architecture + design system; awaiting spec review
**Supersedes nothing. Subordinate to:** `Mera_Haq_PRD_Core_v2.md` (product bible),
`Mera_Haq_Diagnostic_Spec.md` (routing logic, verbatim), `Mera_Haq_14Day_Build_Manual.docx`
(copy/audio/PDF rules), except where §2 Owner Overrides explicitly supersede.

---

## 1. What we are building

The production website for **Mera Haq** — a Hindi-first, audio-first, login-light rights
platform that tells a Hindi-speaking woman, in five tap-only questions and about sixty
seconds, which financial and legal rights are already hers, gives her one quiet action she
can take today, and puts a free phone number in her hand.

Two audiences must both be served by one site:

- **Sunita, 34** — tier-3, 8th standard, reads Devanagari slowly, ₹7,000 Android at 12%
  battery, throttled evening data, phone shared on demand. She is the design target for
  every app route.
- **Priya / Aditya** — urban, English-comfortable forwarder and supporter. They meet the
  home page and the institutional pages, and they must find it credible enough to forward.

The home page is marketing-grade. The app routes are safety-critical. These are different
disciplines and the spec treats them differently throughout.

### In scope

`/` · `/shuru` · `/aapke-card` · `/sabhi-card` · `/card/c1…c10` · `/madad` ·
`/hamare-baare-mein` · `/asar` · PWA offline · 3-language switch · login (optional,
non-blocking) · WhatsApp square PNG + A5 PDF generation · Sakhi chat shell.

### Out of scope (and why)

| Not building | Why |
|---|---|
| WhatsApp bot (F-60…F-67) | Needs Meta Business verification, 1–3 week lead time, a non-personal number, and a BSP contract. P1 in the PRD, and not a website deliverable. `deck()` is built shell-agnostic so the bot can import it unchanged. |
| `/saath-dein`, `/vakt-dijiye` | Owner decision, 16 Aug 2026: dropped for now. Mera Haq is a voluntary social support project, not an NGO, and the vetted-NGO donation directory the PRD specifies is not the right shape. The suppression test survives in trimmed form (§9.6). |
| Scheme pages (F-82) | P2, deliberately deferred by the PRD itself. |
| Pilot-district block (F-44) | No district has been named. `/madad` ships the national directory; the district block is a content slot that renders nothing until populated. |

---

## 2. Owner decisions recorded

Taken 16 August 2026. These resolve gaps between the source documents and reality.

| # | Decision | Consequence |
|---|---|---|
| D1 | **Rights pages ship with a visible DRAFT banner.** | All card content renders in full, behind a persistent «कानूनी समीक्षा बाकी है» strip. A single build constant `LEGAL_SIGNOFF = false` controls it site-wide, including the PDFs and square images. Flipping it to `true` plus setting `REVIEWER_NAME` removes the banner everywhere at once. Honours Build Manual Part I without blocking the build. |
| D2 | **Login wires to a real Supabase project** the owner has already created. | Project ref + anon key needed before the login island is built; nothing earlier depends on it. Magic link + Google OAuth. No phone auth, ever. |
| D3 | **Assets: generate what's missing.** | Square PNGs + A5 PDFs generated at build time; Sakhi avatar drawn as inline SVG; diagnostic audio stubbed with `hi-IN` Web Speech behind the same सुनिए control, every gap listed in `resources/MANIFEST.md` under "missing". |
| D4 | **Transcode the 10 card MP3s, exact naming preserved.** | Delivered filenames map 1:1 to card IDs and that mapping is written into MANIFEST. Originals stay untouched in `resources/`. Compressed mono variants ship in `public/audio/`. |
| D5 | **Deploy to Cloudflare Pages on a `*.pages.dev` subdomain.** | `SITE_URL` is a single env var. The real domain is wired in later once the build is satisfactory; PDFs and QR codes read `SITE_URL`, so a domain change is one variable and a rebuild. |

---

## 3. Architecture

### 3.1 Stack

**Astro 5, `output: 'static'`**, Tailwind CSS with the §4 tokens as the config palette,
TypeScript strict, Vitest, Playwright, `@vite-pwa/astro`, GSAP core + ScrollTrigger.

Astro over Next.js for one decisive reason: **UF-15 stops being a goal and becomes the
default.** `/sabhi-card`, `/card/*` and `/madad` prerender to plain HTML with zero
hydration, so with JavaScript disabled the phone numbers still work — which is the entire
point of that requirement. Next.js App Router would ship the React runtime on every route
and make the 80 KB gz `/shuru` budget a fight. Static output also means Cloudflare Pages
needs no adapter and there is no server request log to leak, which the no-tracking
principle actually depends on.

Islands, and nothing else, get JavaScript:

| Island | Route(s) | Hydration |
|---|---|---|
| `Chrome` (menu, lang pill, mute, audio) | all | `client:load` |
| `Diagnostic` | `/shuru` | `client:load` |
| `DeckView` | `/aapke-card` | `client:load` |
| `HomeMotion` (GSAP) | `/` | `client:visible` |
| `SakhiChat` | `/` | `client:idle` |
| `LoginSheet` | `/`, institutional (header button); `/shuru` (post-S7 sheet only — never a header button) | `client:idle` |

Quick exit is **not an island** — see §9.1.

### 3.2 Budgets

| Route | JS (gz) | Notes |
|---|---|---|
| `/` | ≤ 160 KB | GSAP + ScrollTrigger dynamic-imported on idle, below the fold |
| `/shuru` | ≤ 80 KB | zero GSAP |
| `/card/*`, `/sabhi-card`, `/madad` | ≤ 12 KB | chrome island only |
| Shell HTML+CSS first paint | < 80 KB | UF-13: paints ≤ 2.5 s on 2G |
| Card audio | ≤ 250 KB each | F-05 |
| Square PNG | ≤ 200 KB | F-30 |
| A5 PDF | ≤ 400 KB | F-31 |

Lighthouse mobile: `/shuru` ≥ 90 performance, `/` ≥ 80, both 100 accessibility.

### 3.3 Language switching

F-110 requires instant, client-side, no reload, no loss of mid-diagnostic progress — on
pages that are static HTML. Three mechanisms were considered:

1. Inline all three languages in the DOM, toggle with `hidden` — zero latency, but triples
   card-page weight (~+12 KB gz each).
2. Fetch the language JSON on switch — light first paint, one network hit on first switch,
   service-worker cached after.
3. Separate `/hi/ /hg/ /en/` routes — forces a reload, violates F-110 r2 outright. Rejected.

**Adopted: hybrid.** Chrome strings, diagnostic questions and all UI labels (small) inline
all three and toggle with zero network. Card *body* content ships `hi` inline and fetches
`hg`/`en` JSON on first switch. JS-disabled visitors get Hindi, which is the primary
persona by design. `<html lang>` updates on switch (F-110 r7). Persisted to
`localStorage["mh_prefs"].lang`. No locale detection, ever (F-112).

### 3.4 Storage

`localStorage["mh_prefs"]` is the only key written. Shape:

```ts
{ deck: CardId[], v: 2, lang: 'hi'|'hinglish'|'en', region?: RegionId|'unknown',
  muted: boolean, seenAudioNote: boolean, seenLoginSheet: boolean }
```

**Answers are never written.** Not to localStorage, not to memory beyond the diagnostic
component's lifetime, not to Supabase. If the phone is inspected there is nothing to read.
`localStorage` blocked (private mode) → deck held in memory for the session plus a one-line
note; the flow continues (UF-15).

---

## 4. Design system

### 4.1 Colour

The §2 palette from the build brief, verbatim, as CSS custom properties in
`src/styles/tokens.css` and mirrored into the Tailwind config.

Semantic grammar, enforced everywhere: **pink = her action / her right · blue =
government, trust, helpline · green = "sahi hai / muft" confirmations · red-tint = "galat
hai" verdict lines · navy = authority and structure.** One glance teaches the system.

Two rules are tests, not conventions:

- **`--pink-600` exclusivity.** A test walks the rendered DOM of every route and fails the
  build if two `#D6336C` action surfaces appear on one screen. Inherited intact from the
  PRD's marigold rule.
- **`--pink-500` is decorative-only.** `#FF4081` on white is 3.3:1. A lint rule forbids it
  as a `color` on any text node; it may only appear in `background`, `border-color`,
  gradients and SVG fills at ≥ 24px.

### 4.2 Type

```
Latin       Montserrat            400 500 700 800   @fontsource, self-hosted
Devanagari  Mukta                 400 500 700       @fontsource, unicode-range gated
Data        JetBrains Mono        400 700           numerals only
Quotes      Tiro Devanagari Hindi / Martel          lazy, statute pages only
```

Stack: `"Montserrat","Mukta",system-ui,sans-serif`, with `unicode-range` on the `@font-face`
declarations so Devanagari pulls Mukta and Latin pulls Montserrat deterministically, and
Mukta's Latin subset never downloads.

**Metric matching is measured, not guessed.** A build script reads the OS/2 and hhea tables
out of the installed font binaries and emits `size-adjust`, `ascent-override` and
`descent-override` for the Mukta `@font-face`, so a mixed-script line like «PMJDY खाता
खोलें» has no visible seam. The computed values are committed with the measurement script
alongside them.

**Mixed weight is the sitewide emphasis mechanic, with a different delta per script:**
Montserrat 400 → 800 for Latin, Mukta 400 → 700 for Devanagari. Mukta at 800 turns
conjuncts to mud at display size.

**One base, two ceilings.** 18px base on every route (F-01). Marketing routes (`/`,
`/hamare-baare-mein`, `/asar`) scale with `clamp()` to a 76px display. App routes
(`/shuru`, `/card/*`, `/madad`, `/aapke-card`, `/sabhi-card`) cap at 30px. Nothing shouts
where she is trying to concentrate.

**Acid test, every release:** स्त्रीधन and ज़िंदगी must render correctly in-browser at every
weight used, in every generated PDF, and in every square PNG.

### 4.3 Signature — the शिरोरेखा rule and the Haq Card deck

**The shirorekha rule.** A 3px `--pink-600` rule sitting *above* a heading, exactly the
width of that heading's first line. The shirorekha is the horizontal stroke that runs
across the top of every Devanagari word — the mark is derived from the script the product
is written in, and it reads correctly over Latin and Devanagari alike. It is the recurring
structural token: section headings, card section headings, the hero.

**The Haq Card deck.** Ten cards as a physical, fanned, slightly-rotated stack. The card is
genuinely the product — it gets printed, put on a table, passed around a room of eight
women, photographed, forwarded. Fixed `+4°` rotation delta, pink card behind, navy title,
no shadow ramp. One component serves three jobs: the hero visual, the horizontal gallery in
§6.5, and the S7 reveal.

### 4.4 Radius, elevation, surfaces

Bimodal radius, derived from a print constraint rather than taste:

```
--r-sheet:  56px   section sheets only (the light sheet meeting the dark chapter)
--r-card:   20px   Haq Cards, surfaces
--r-action: 12px   buttons, tappable things
--r-pill:  999px   language pill, chips
--r-0:        0    Ek Kadam box, authority block — plus a 3px left rule
```

PRD §5.7 r5 requires the Ek Kadam and authority boxes to stay distinguishable **printed
greyscale on a cheap laser printer, by border weight not colour**. A square box with a heavy
left rule survives a photocopy; a rounded tint does not. So the two boxes that must survive
print are the two with zero radius.

**Elevation: almost none.** One shadow token for the sticky header, one for the Sakhi FAB.
Depth comes from tint (`--blue-050`, `--pink-050`) because tint survives both a cheap LCD at
40% brightness and a greyscale print.

**Bloom fields are pure `radial-gradient`, no `filter: blur()`.** A large blurred layer is
one of the most expensive things you can put on a ₹7k Android. A radial-gradient is already
soft — visually identical, free.

**Zero photography.** Stock imagery of Indian women is the generic-NGO cluster, and distress
imagery is forbidden outright. The tilted-frame motif applies to the Haq Card itself.

### 4.5 Spacing and targets

4px base. Steps `4 8 12 16 24 32 48 64 96 128 160`. Marketing section padding 96–160px; app
section padding 24–32px. Minimum tap target **48px everywhere**, **56px for helpline
numbers and primary CTAs**. `focus-visible` on everything, never removed. No
placeholder-only labels.

---

## 5. The diagnostic engine

### 5.1 One implementation

`src/lib/deck.ts` exports one pure function. `src/lib/matrix.v2.json` is the Diagnostic
Spec §7 JSON, **verbatim, zero logic changes**.

```ts
export function deck(answers: Answers): CardId[]   // GATE → SCORE → PIN → RANK → FILL
```

`/shuru` and the Sakhi chat shell both import this symbol. `tests/deck.spec.ts` asserts it
two ways: **import identity** (both shells reference the same function object) and a
**fuzz over the full answer space** confirming both shells emit byte-identical decks. A
second implementation cannot drift in, because a second implementation cannot exist.

The bot, when built, imports the same module.

### 5.2 Test fixtures are the spec's worked examples

Written before the implementation (TDD). All must pass:

| Case | Input | Expected deck |
|---|---|---|
| A | Q1a · Q2b · Q3{a,e} · Q4a · Q5{papers,SIM} | `[C2, C6, C1, C3, C8]` |
| B | Q1c · Q2e · Q3{c,e} · Q4b · Q5{} | `[C9, C6, C7, C10, C8]` |
| C | Q1d · Q2a · Q3{d} · Q4a · Q5{bank,SIM} | `[C5, C7, C6, C2, C8]` |
| Explorer | Q3=f, no pins, maxScore ≤ 2 | `[C6, C7, C2, C1, C8]` |
| All skipped | every question skipped | `[C6, C7, C2, C1, C8]` |

Plus: C8 always last; deck length always exactly 5; gates never delete a card from
`/sabhi-card`; region contributes zero weight (RQ-7).

---

## 6. Routes

### 6.1 `/` — home

Order is fixed: **Hero → How-to → Value → Impact → 10 Cards → Features → FAQ → Footer.**
Login top-right (home and institutional only). Sakhi FAB bottom-right, never overlapping the
helpline strip or the primary CTA.

Above the fold at 360×740: the hero question, the सुनिए control, «मेरा हक़ बताओ», «सीधे सारे
कार्ड देखें», and the 181 · 15100 strip. Verified by screenshot before anything else is
built.

GSAP choreography per the build brief §5. Two constraints taken as binding: **at most two
pinned sections on the page** (Value and the 10-Cards gallery — and the gallery unpins
below 768px, so mobile has one), and `ScrollTrigger.refresh()` after fonts load, because
Devanagari webfonts change line-box height on swap and will desync every pin.

`prefers-reduced-motion: reduce` → `gsap.matchMedia` kills every timeline and ScrollTrigger;
everything renders in final state instantly. This audience overlaps exactly with the
low-end devices where motion hurts.

### 6.2 `/shuru` — the diagnostic

S0 welcome → S0b optional region → Q1–Q5 → S6 → S7 reveal → `/aapke-card`.

One question per screen. 5-dot progress, never "Question 3 of 5". Single-selects
auto-advance ~400 ms after the highlight; multi-selects use explicit CTAs. Icon per option,
back arrow, silent «छोड़ें» contributing zero. Q1=d hides Q3(a) and Q3(b) **and** selects
audio variant B.

S0b is visually and behaviourally identical to a real question — no "optional" badge, no
separate styling (RQ-3). «पता नहीं / छोड़ें» is a full first-class option (RQ-2).

**S7 never echoes her answers.** No "kyunki aapne bataya ki…". The reveal must be clean if
seen over her shoulder. C8 carries «यह कार्ड सबके लिए है».

**Near-zero GSAP.** Option highlight, S6 pulse ~1.5 s, S7 cards fanning in once. All CSS.
No scroll effects. This route is fast and calm.

### 6.3 `/card/c1…c10`

Fixed template, in this order: सुनिए **first element on the page** → कानून क्या कहता है →
असली ज़िंदगी में (Don'ts, each ending in its «यह सही नहीं है» verdict, red-050 tint) →
सँभाल कर रखें → **exactly one** एक कदम आज box → authority block → WhatsApp share + PDF
download → यह भी जानिए cross-links → footer: «यह जानकारी है, सलाह नहीं» + reviewer credit +
जाँचा गया date in mono.

Content from the two card masters. Verified-on date: **13 अगस्त 2026** (the masters' own web
verification date).

### 6.4 `/madad`

Universal helpline block expanded on load: 181 · 112 · 15100 · 14454 · 1930 · 14448 · 14490.
Every number a `tel:` link with a ≥56px target and the label «दबाएँ». One collapsible row
per card, C1…C10, collapsed by default, opening one at a time, each carrying the PRD §5.6
mapping table exactly. Each row has its own small सुनिए. सुनिए reads numbers **digit by
digit** — she may be writing on her hand.

Fully functional offline once cached. This is the page most likely to be needed when the
data has run out.

### 6.5 Global chrome

☰ top-left · quick-exit ✘ top-right · language pill top-centre. **These three never move and
never swap.** Login is omitted entirely on app routes rather than crowding them.

Menu: the eight PRD §5.5 items, full-screen overlay, 56px rows, quick-exit still functional
while open. «सवाल दोबारा करें» shows the confirm step.

---

## 7. Content

### 7.1 Model

`src/content/cards/{c1..c10}.{hi,hinglish,en}.json`, typed by an Astro content collection
schema. Every card: `id, title, kanoon[], asliZindagi[], sambhaal[], ekKadam, authority{},
crossLinks[], verifiedOn`.

Hinglish and Hindi come from the two masters. **English is authored plain English for
Priya/Aditya, not transliteration** (PRD §5.11 r5).

### 7.2 «एक कदम आज» — new copy requiring owner approval

The card masters give *Dos* lists but no designated single action, and the Build Manual's
Ek Kadam table is for the superseded 7-card routing. F-28 mandates exactly one per card, so
these are authored. Each is quiet, doable alone, non-confrontational, ≤12 words, bazaar
vocabulary:

| Card | एक कदम आज |
|---|---|
| C1 Streedhan | आज अपने गहनों की लिस्ट बनाएँ — फोटो लें, तारीख़ डालें। |
| C2 Economic abuse | आज से एक छोटी डायरी रखें — कब, क्या, कितना। |
| C3 Residence | उस पते वाले काग़ज़ इकट्ठे करें — आधार, राशन कार्ड, बिजली का बिल। |
| C4 Maintenance | महीने के खर्चे का हिसाब लिखना आज से शुरू करें। |
| C5 Inheritance | कोई भी काग़ज़ साइन करने से पहले 15100 पर मुफ़्त सलाह लें। |
| C6 Bank account | कल बैंक जाकर अपने नाम का ज़ीरो-बैलेंस खाता खोलें। |
| C7 Documents | हर काग़ज़ की फोटो लेकर अपने ईमेल पर भेज दें। |
| C8 Legal aid | आज फ़ोन में दो नंबर सेव करें — 15100 और 181। |
| C9 Widow | मौत के सरकारी काग़ज़ की 8–10 पक्की कॉपियाँ ले लें। |
| C10 Debt | वसूली के हर फ़ोन और आने-जाने का तारीख़ वाला रिकॉर्ड रखें। |

C4 alternative if the owner prefers the referral over the record: «DLSA से गुज़ारे की मुफ़्त
जानकारी लें — 15100 दबाएँ।» The expense record was chosen because the card's own reasoning
is that the amount is set by the monthly expense figure, and because it is the version she
can do alone and quietly today.

### 7.3 Copy rules (binding)

≤8-word sentences target, hard cap ~12. Bazaar vocabulary only — हक़ not अधिकार, काग़ज़ not
दस्तावेज़. First person. **Facts and events, never accusations** — if a statement needs a
villain to make sense, it is rewritten. Information, never advice. Nothing that suggests
confrontation. The frozen Devanagari strings in the PRD are copied verbatim and not
improved.

---

## 8. Assets pipeline

### 8.1 Audio mapping (exact, from the delivered zip)

| Delivered filename | Card |
|---|---|
| `Card 1 - Streedhan.mp3` | C1 |
| `Card 2- Kamayi.mp3` | C2 |
| `Card 3 - Ghar mein rehene ka haq.mp3` | C3 |
| `Card 4 - Guzara Bhatta.mp3` | C4 |
| `Card 5 - Beti ka Hissa.mp3` | C5 |
| `Card 6 - Apna Bank Khata.mp3` | C6 |
| `Card 7 - Kaagaz.mp3` | C7 |
| `Card 8 - Muft Vakil.mp3` | C8 |
| `Card 9 - Vidhwa ka hissa.mp3` | C9 |
| `Card 10 - Karz aapka nhi.mp3` | C10 |

Originals (~5 MB each) stay in `resources/` untouched. `public/audio/cN.webm` (Opus, mono,
~40 kbps) plus `cN.mp3` fallback ship at ≤250 KB. Any clip exceeding 60 s is reported in
MANIFEST as a re-record decision, not silently truncated.

### 8.2 Missing, and how each gap is handled

| Missing | Handling |
|---|---|
| S0, S0b, Q1–Q5 screen clips, per-option clips, Q3 variants A/B | `hi-IN` Web Speech behind the identical सुनिए control; listed in MANIFEST under "missing" so the owner knows exactly what to record |
| `/madad` digit-by-digit audio | Same, with a digit-splitting reader |
| 1080×1080 square PNGs | Generated at build: HTML template → headless Chrome → PNG, ≤200 KB, fonts embedded, readable at 25% zoom |
| A5 PDFs | Generated at build: A5 single page, ≤400 KB, Devanagari embedded **and subsetted**, greyscale-legible, QR to `/card/cN#audio` |
| Sakhi avatar | Inline SVG, flat, drawn in the pink/navy palette |

### 8.3 Verification

Every generated PDF and PNG is opened and checked for स्त्रीधन and ज़िंदगी conjunct
correctness before the build is considered green. Unembedded or unsubsetted fonts are the
number one failure mode for Hindi PDFs.

---

## 9. Safety invariants

Ten. Any one failing means the build is not done. Each has a named enforcement mechanism —
none of these is a convention.

| # | Invariant | Enforced by |
|---|---|---|
| 9.1 | Quick exit ✘ on every screen, top-right, <100 ms, works offline, mid-menu, mid-audio, mid-animation | A bare inline `<script>` in `<head>`, capture-phase, bound before any hydration or GSAP exists. Cancels `speechSynthesis`, pauses every `<audio>`, `history.replaceState`, `location.replace`. It never waits for a framework. Playwright timing assertion + a trace taken mid-animation. |
| 9.2 | S7 and `/aapke-card` never display, imply or store her answers | Answers never leave the diagnostic component's closure. A test asserts `localStorage` after a full run contains no answer-shaped key, and that S7's DOM contains no option string. |
| 9.3 | No autoplay audio anywhere, ever | Every play path requires a user gesture. A test asserts zero `play()` calls on load across all routes. |
| 9.4 | `tel:` everywhere a number appears; numbers in mono; ≥48px targets, ≥56px helpline/CTA | `content.spec.ts` walks the rendered DOM of every route: every number matching a helpline pattern must be inside an `<a href="tel:">` with a computed box ≥56px. |
| 9.5 | No cookies, no third-party requests, self-hosted fonts, aggregate counters only | Playwright network assertion: zero requests to any origin but our own, on every route. |
| 9.6 | No donate/volunteer surface renders on hero, S0–S7, cards, `/madad` | `suppression.spec.ts`. The pages themselves are dropped (§1), so the test's job is now regression-prevention: it scans the rendered DOM of every rights route for donate/volunteer vocabulary and outbound-giving links in all three languages and fails on any hit. If those pages are ever reintroduced, the guard is already in place. |
| 9.7 | Login never required; popup appears once, dismisses in one tap, never blocks, never re-shows on re-entry with an existing deck | `seenLoginSheet` in `mh_prefs`; test drives a full run, dismisses, reloads, asserts no re-show. |
| 9.8 | Devanagari conjunct acid test passes at every weight used | In-browser screenshot assertion at 400/500/700/800, plus every PDF and PNG. |
| 9.9 | `prefers-reduced-motion` fully honoured | `gsap.matchMedia` teardown; screenshot in both modes must show identical final state. |
| 9.10 | `/madad`, `/sabhi-card`, all card pages work with JS disabled and offline after first visit | Playwright with `javaScriptEnabled: false` and with the network killed. |

Plus the two colour rules from §4.1, which are also tests.

**The honesty rule stands:** we never claim quick exit makes her safe. The About and Madad
pages carry the Build Manual D9 shared-phone note verbatim — the site may still appear in
browser history; use Private/Incognito or clear it after. Honest words, not clever
technology.

---

## 10. Login

Optional, non-blocking, and it stores the **output deck only, never the answers** — the
no-echo rule is absolute and survives into the account.

- Header «लॉग इन» on home and institutional routes only. Never on `/shuru`, cards, or
  `/madad`, where it would compete with the two fixed safety controls.
- Post-diagnosis sheet after S7, when she taps toward her cards: one dismissible sheet,
  «अपने कार्ड सुरक्षित रखें», two equal-weight actions `[ लॉग इन करें ]` and `[ अभी नहीं ]`.
  One tap to dismiss, remembered for the session, never re-shown mid-journey, never blocks
  the deck. localStorage remains the default persistence.
- Supabase Auth: magic link or Google OAuth. **No phone-number auth** — the PRD's reasoning
  about phone numbers on shared devices stands.
- Synced row: `{ deck, v, lang }`. Nothing else. Row-level security scoped to the auth user.
- Skipping loses nothing.

---

## 11. Testing

| Suite | Covers |
|---|---|
| `tests/deck.spec.ts` | Worked examples A/B/C, explorer, all-skipped, gates, C8-last, deck length, one-engine identity + fuzz |
| `tests/suppression.spec.ts` | §9.6 |
| `tests/content.spec.ts` | All 10 cards in all 3 languages, `tel:` coverage, tap-target sizes, disclaimer + reviewer credit on every rights page, exactly one Ek Kadam per card |
| `tests/safety.spec.ts` | §9.1–9.10 |
| `tests/tokens.spec.ts` | Pink-600 exclusivity, pink-500 never a text colour, AA on every token pairing used |
| Lighthouse | `/` ≥ 80 perf, `/shuru` ≥ 90 perf, 100 a11y |
| accesslint | scan → inspect → fix on `/`, `/shuru`, `/card/c1`, `/madad` |

---

## 12. Build sequence

1. Extract resources → `resources/MANIFEST.md` (name → card mapping, plus the "missing" list)
2. Extract card copy from both masters into `src/content/cards/`
3. Tokens + fonts + metric-matching script → chrome components
4. Home page with GSAP → **screenshot at 360/768/1440 → owner sign-off before anything else**
5. Diagnostic + engine (TDD, tests first)
6. Card pages → `/madad` → `/aapke-card` → `/sabhi-card`
7. i18n → PWA → login → institutional pages
8. Asset generation (PNG, PDF, audio transcode)
9. Review loop: chrome-devtools at 3 widths → web-design-guidelines → accesslint → Lighthouse
10. `verification-before-completion`: run the §13 checklist, paste evidence

---

## 13. Acceptance checklist

- [ ] `deck()` passes A, B, C, explorer, all-skipped; Sakhi shell uses the same function, proven by test
- [ ] Hero question + CTA + helpline strip visible without scroll at 360×740 (screenshot)
- [ ] All 8 home sections in order; GSAP choreography per brief; reduced-motion kills it (both modes captured)
- [ ] Quick exit <100 ms from every route including mid-animation (trace)
- [ ] स्त्रीधन / ज़िंदगी render correctly in Montserrat+Mukta at all weights (screenshot)
- [ ] AA on every token pairing used; zero pink-500 text failures (axe/accesslint output)
- [ ] Lighthouse mobile: `/` ≥ 80 perf, `/shuru` ≥ 90 perf, both 100 a11y (report)
- [ ] Offline: `/madad` + cards + deck work after first visit with network killed (screenshot)
- [ ] JS disabled: `/sabhi-card`, `/card/*`, `/madad` fully readable, numbers tappable
- [ ] Login popup appears once post-reveal, «अभी नहीं» dismisses in one tap, never blocks, never re-shows; header Login only on home/institutional
- [ ] Suppression test green; zero third-party network requests (screenshot)
- [ ] All three languages switch instantly mid-diagnostic without losing answers

---

## 14. Open questions — owner actions

| # | Question | Blocks |
|---|---|---|
| O1 | Supabase project ref + anon key | The login island only. Everything else proceeds. |
| O2 | Reviewer name for the footer credit, and the sign-off email | Removing the DRAFT banner. Content ships behind it meanwhile. |
| O3 | Approval of the ten «एक कदम आज» lines in §7.2 | Card pages ship with them as drafted; changing one is a one-line content edit. |
| O4 | Pilot district — OSC address, DLSA location, Protection Officer route (F-44) | The `/madad` district block. National directory ships regardless. |
| O5 | Real domain, when ready | Nothing. `SITE_URL` is one variable. |
| O6 | Impact page numbers (F-81) | `/asar` ships with «—» placeholders and the published counting method. The PRD forbids invented numbers and no pilot has run. |
