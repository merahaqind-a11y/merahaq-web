# Mera Haq

A Hindi-first, audio-first, login-light rights platform. Five tap-only questions, about
sixty seconds, and it tells a Hindi-speaking woman which financial and legal rights are
already hers, gives her one quiet action she can take today, and puts a free phone number
in her hand.

It is not a legal library, not a scheme finder, and not a helpline. It is the router
between them.

---

## Run it

```bash
npm install
npm run metrics      # measures the font pair, writes src/styles/font-metrics.generated.css
node scripts/copy-fonts.mjs
npm run dev          # http://localhost:4321
```

```bash
npm run build        # 17 static pages into dist/
npm run preview
npm test             # 86 unit tests (Vitest)
npm run test:e2e     # 145 end-to-end tests (Playwright, 3 viewports)
```

`npm run metrics` and `copy-fonts` only need re-running after a font version bump.

### Environment

Copy `.env.example` to `.env`. Nothing here is required to run the site — absent values
disable the optional surfaces rather than breaking the build.

| Variable | Effect when absent |
|---|---|
| `SITE_URL` | Falls back to the Cloudflare Pages preview domain |
| `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` | Login surfaces do not render at all |
| `PUBLIC_SUPABASE_GOOGLE` | Google button hidden. The project currently reports `google: false`; enabling it needs a Google Cloud OAuth client in the Supabase dashboard |
| `PUBLIC_LEGAL_SIGNOFF` | Stays `false`, so every rights page shows the DRAFT banner |
| `PUBLIC_REVIEWER_NAME` | Footer credit shows a placeholder |

---

## Architecture

**Astro 7, `output: 'static'`, no SSR adapter.** That is a deliberate choice, not a
default: `/sabhi-card`, `/card/*` and `/madad` prerender to plain HTML with zero
hydration, so with JavaScript disabled the phone numbers still dial. There is also no
server request log to leak, which the no-tracking principle depends on.

JavaScript goes only where it is earned:

| Route | Ships |
|---|---|
| `/` | Chrome + GSAP (dynamically imported on idle) |
| `/shuru` | Chrome + the diagnostic. **Zero GSAP** — asserted by test |
| `/card/*`, `/sabhi-card`, `/madad` | Chrome only |

```
src/
├── lib/
│   ├── deck.ts            THE diagnostic engine. One implementation, three shells.
│   ├── matrix.v2.json     Routing matrix, verbatim from the Diagnostic Spec
│   ├── prefs.ts           The ONLY module that touches localStorage
│   ├── lang.ts            Instant client-side language switch
│   ├── cards.ts           Card registry: titles, summaries, icons, cross-links
│   ├── motion.ts          GSAP choreography, home route only
│   └── auth.ts            Supabase adapter, no-ops without env vars
├── content/cards/         Card bodies, 10 cards x 3 languages
├── components/            chrome/ · home/ · card/ · diagnostic/
├── pages/                 17 routes
└── styles/tokens.css      Palette, type scale, spacing, radius
```

---

## Things that will look wrong until you know why

Change these only deliberately. Each one is load-bearing and most are covered by a test
that will fail if you undo it.

**Quick exit is an inline `<head>` script, not a component.** It is bound at capture
phase before any island hydrates, so it works mid-animation, mid-audio, with the menu
open, and with every JS bundle blocked. It begins navigating in ~15ms, faster than a
plain `<a>`. The masthead sits at `z-60`, above the menu overlay at `z-50`, because at
`z-40` the overlay covered the exit and the tap landed on a menu link instead.

**Answers are never stored.** Not in `localStorage`, not in Supabase, not anywhere. The
diagnostic computes the deck in a closure and throws the answers away. `prefs.ts` throws
if asked to persist an answer-shaped field, and a test drives a full run then asserts
that no option string appears anywhere in the reveal DOM. This is why the reveal is safe
to read over her shoulder.

**`translate="no"` on rights routes.** Chrome was observed machine-translating the page
on an English-locale browser: it rewrote `<html lang>` from `hi` to `en` and replaced
lawyer-reviewed statute text with unreviewed output. An authored English track already
exists behind the language pill.

**The type scale changes with the script.** Latin runs ~25–30% wider per word than
Devanagari, so the display steps step down for the Hinglish and English tracks. Without
it the Hindi headline sits on two lines and the Hinglish one sprawls onto four.

**`--pink-600` is the only colour allowed to signal action**, and only one may be visible
per screen. It is 4.75:1 on white but only 4.23:1 on the tinted canvas, so pink *text* on
any tint steps down to `--pink-700`. Both rules are tests.

**Ek Kadam and the authority block have zero border-radius and a 3px left rule.** The PRD
requires them to stay distinguishable when printed greyscale on a cheap laser printer, by
border weight rather than colour. A rounded tint does not survive a photocopy.

**Impact numbers are the words "Not yet", not figures and not blank.** No pilot has run,
the PRD forbids invented numbers, and blank reads as broken. A test asserts they never
become digits.

**The helpline ticker pauses on hover, touch and focus**, and does not move at all under
`prefers-reduced-motion`. A moving `tel:` link is a usability failure.

**GSAP has a four-second failsafe** that force-reveals anything still at opacity 0.
`gsap.from({opacity:0})` zeroes opacity immediately; if its ScrollTrigger never fires the
content is invisible forever, and a blank section is indistinguishable from a broken site.

---

## Status

**Done** — diagnostic engine (24 tests including a 19,440-case fuzz) · design system ·
global chrome · 3-language switch · home page with GSAP · `/shuru` · all 10 card pages
with full content · `/sabhi-card` · `/aapke-card` · `/madad` · About · Impact · Supabase
adapter and migration.

**Not built yet** — audio transcode and the `सुनिए` wiring · PWA offline caching ·
WhatsApp square PNG and A5 PDF generation · the Sakhi chat shell · the login sheet UI ·
accessibility and Lighthouse passes.

**Out of scope** — the WhatsApp bot (needs Meta Business verification; `deck()` is built
shell-agnostic so it can import the same function unchanged).

### Waiting on the owner

| # | Needed | Blocks |
|---|---|---|
| 1 | Lawyer's written sign-off + reviewer name | Removing the DRAFT banner. Set `PUBLIC_LEGAL_SIGNOFF=true` |
| 2 | Approval of the ten «एक कदम आज» lines | Nothing; they ship as drafted |
| 3 | Google OAuth client in Supabase | The Google login button. Magic link works today |
| 4 | Pilot district: OSC address, DLSA location, Protection Officer route | The `/madad` district block. The national directory ships regardless |
| 5 | The real domain | Nothing. `SITE_URL` is one variable |
| 6 | The ten card audio recordings | `सुनिए` currently falls back to `hi-IN` speech synthesis. See `resources/MANIFEST.md` |

### Source documents

The PRD, Diagnostic Spec, card masters and Build Manual live one directory up. The design
spec and implementation plan derived from them are in `docs/superpowers/`. Where this
build deviates from the PRD, the decision is recorded in the spec's Owner Decisions table
(D1–D10) with its reason.

---

## Deploy

Static output, so any static host works. Cloudflare Pages:

```
build command:      npm run build
output directory:   dist
environment:        SITE_URL, PUBLIC_SUPABASE_* as above
```

The Supabase migration in `supabase/migrations/0001_decks.sql` needs running once in the
SQL editor. It creates one table holding the output deck, the matrix version and the
language, with CHECK constraints enforcing exactly five valid cards with C8 last, and RLS
scoping every row to its own user. It deliberately holds nothing else.
