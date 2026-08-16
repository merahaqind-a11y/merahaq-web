# Mera Haq — Product Requirements & Build Memory

## Original problem statement
Design-elevate the existing Astro + Tailwind + GSAP Mera Haq Hindi-first legal-rights platform from the provided GitHub repository. Preserve the diagnostic engine, routing matrix, i18n copy/schema, safety chrome, lightweight rights routes, local-only privacy behavior, self-hosted fonts, locked palette, and no third-party tracking. Refine the home page to agency-quality with stronger rhythm, chapter backgrounds, hero/card motion, impact storytelling, responsive gallery, feature hierarchy, accessibility, and reduced-motion support.

## Architecture decisions
- Astro static output remains the delivery model; the home page owns GSAP loaded on idle.
- `src/lib/deck.*` and `src/lib/matrix.v2.json` remain untouched and are treated as product-critical.
- CSS tokens remain the single palette/type/radius source; pink communicates user action, blue communicates trust/help.
- Desktop gallery uses GSAP pin/scrub; mobile remains native scroll-snap for safety and performance.
- Safety behavior stays inline/static: quick exit, menu, helplines, audio, and privacy copy are not dependent on home animation.

## User personas
- Hindi-first women on low-cost phones who need clear, safe, actionable rights information.
- Family, community, legal-aid, and NGO facilitators helping someone navigate the cards.
- Urban supporters and designers evaluating trust, craft, and transparency.

## Core requirements (static)
- Five-question diagnostic that returns five relevant cards.
- Ten browsable rights cards with practical next steps and helpline routes.
- Hindi, Hinglish, and English language switching.
- Quick exit, visible helpline numbers, listen controls, offline-friendly rights surfaces.
- No analytics, pixels, cookies, or third-party font/network requests.
- Home page communicates trust, honesty, and an immediate route to action.

## Implemented (2026-08-16)
- Refined section rhythm to consistent spacious bands and rounded dark impact chapter.
- Strengthened hero spacing, card elevation, hover treatment, and mobile fold density.
- Added hero deck lift/pause motion with reduced-motion compatibility.
- Added responsive card-gallery test hooks and mobile progress affordance.
- Reworked impact stats spacing and honesty block into the chapter centerpiece.
- Reworked feature grid with stronger icons, borders, and hover hierarchy.
- Tightened focus rings and unified link underline behavior.
- Locked Vitest suite passed: 86 tests across deck, i18n, and token coverage.

## Prioritized backlog
- P0: Run Astro build and Playwright home/chrome regression under Node >=22.12.0.
- P1: Capture and review 360x740, 768, and 1440 screenshots after the runtime environment is corrected.
- P1: Verify Lighthouse mobile/a11y targets and reduced-motion screenshot equivalence.
- P2: Replace impact em-dash placeholders only after real pilot counts and counting methodology exist.

## Remaining next tasks
1. Use Node 22.12+ and run `npm run check`, `npm run build`, and the Playwright suites.
2. Inspect console output and responsive screenshots at the three required widths.
3. Keep the design pass limited to home presentation; do not alter deck logic or frozen copy.
