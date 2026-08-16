import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power3.out' });

/**
 * Home-page scroll choreography. This file is imported ONLY by the home route, on idle,
 * after first paint. /shuru and the card pages contain no GSAP at all — those routes are
 * fast and calm, and their three micro-moments are CSS.
 *
 * Two constraints are treated as hard rules rather than preferences:
 *
 *   · At most TWO pinned sections on the page. Excessive pinning fights native scroll
 *     and hurts mobile badly. The two here are Value and the card gallery, and the
 *     gallery unpins below 768px because pinned horizontal scroll janks on the exact
 *     device this audience uses.
 *
 *   · ScrollTrigger.refresh() after fonts settle. Devanagari webfonts change line-box
 *     height when they swap in, which silently desyncs every pin. This is not optional
 *     on a Devanagari-first site.
 */
export function initHomeMotion(): () => void {
  const mm = gsap.matchMedia();

  mm.add(
    {
      reduce: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
      motion: '(prefers-reduced-motion: no-preference)',
    },
    (ctx) => {
      const c = ctx.conditions as { reduce: boolean; desktop: boolean; motion: boolean };

      // This audience overlaps exactly with the low-end devices where motion hurts.
      // Everything renders in its final state, instantly. No timelines are created at
      // all — not paused ones, none.
      if (c.reduce) {
        gsap.set('[data-anim]', { clearProps: 'all', opacity: 1, x: 0, y: 0, yPercent: 0 });
        return;
      }

      // ── Hero ───────────────────────────────────────────────────────────────────
      // Words rise under a clip. Hand-split into spans by the component rather than
      // SplitText — it keeps the original text nodes intact for screen readers and for
      // the language switcher, and adds no plugin weight.
      gsap.from('[data-anim="hero-word"]', {
        yPercent: 110,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power3.out',
      });

      // The CTA pulses ONCE, two seconds after load. Never a loop — a repeating pulse
      // on a shared phone reads as a notification, which is a safety problem, not a
      // design one.
      gsap.to('[data-anim="hero-cta"]', {
        scale: 1.02,
        duration: 0.35,
        delay: 2,
        yoyo: true,
        repeat: 1,
        ease: 'sine.inOut',
      });

      gsap.from('[data-anim="deck-back"]', {
        opacity: 0,
        rotate: 0,
        duration: 0.9,
        delay: 0.35,
        stagger: 0.08,
      });

      // Ambient bloom drift. ease:'none' and a very long duration so it never reads as
      // an event — it should be felt, not noticed.
      gsap.to('[data-anim="bloom"]', {
        xPercent: 6,
        yPercent: -5,
        duration: 22,
        repeat: -1,
        yoyo: true,
        ease: 'none',
      });

      // ── Section headings ───────────────────────────────────────────────────────
      for (const h of gsap.utils.toArray<HTMLElement>('[data-anim="section-heading"]')) {
        gsap.from(h, {
          opacity: 0,
          y: 24,
          duration: 0.5,
          scrollTrigger: { trigger: h, start: 'top 88%' },
        });
      }

      // ── How-to ─────────────────────────────────────────────────────────────────
      gsap.from('[data-anim="howto-step"]', {
        opacity: 0,
        y: 40,
        duration: 0.5,
        stagger: 0.12,
        scrollTrigger: { trigger: '[data-section="howto"]', start: 'top 82%' },
      });

      gsap.from('[data-anim="howto-line"]', {
        scaleX: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-section="howto"]',
          start: 'top 75%',
          end: 'bottom 65%',
          scrub: 1,
        },
      });

      // ── Value — PIN 1 of 2 ─────────────────────────────────────────────────────
      if (c.desktop) {
        ScrollTrigger.create({
          id: 'value-pin',
          trigger: '[data-section="value"]',
          start: 'top 20%',
          end: 'bottom 85%',
          pin: '[data-anim="value-claim"]',
          pinSpacing: false,
        });
      }

      // Deliberately NOT scrubbed. Scrub ties opacity to scroll position, so scrolling
      // back up fades the text out again — content vanishing as she scrolls reads as a
      // fault, not as polish. Scrub is for the decorative progress line; words get a
      // one-way reveal that never reverses.
      gsap.from('[data-anim="value-row"]', {
        opacity: 0,
        x: 28,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '[data-section="value"]',
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      });

      // ── Impact — count-up on the dark chapter ──────────────────────────────────
      // snap:1 so a partial number is never on screen. Elements with no `data-to`
      // are the «—» placeholders and are deliberately left alone: the PRD forbids
      // invented numbers, and animating an em dash to zero would invent one.
      for (const el of gsap.utils.toArray<HTMLElement>('[data-anim="stat"]')) {
        const to = Number(el.dataset['to'] ?? '');
        if (!Number.isFinite(to) || to <= 0) continue;
        gsap.fromTo(
          el,
          { textContent: 0 },
          {
            textContent: to,
            duration: 1.4,
            ease: 'power1.out',
            snap: { textContent: 1 },
            scrollTrigger: { trigger: el, start: 'top 75%', once: true },
          },
        );
      }

      // ── Card gallery — PIN 2 of 2, desktop only ────────────────────────────────
      if (c.desktop) {
        const track = document.querySelector<HTMLElement>('[data-anim="gallery-track"]');
        const section = document.querySelector<HTMLElement>('[data-section="cards"]');
        if (track && section) {
          const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
          gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              id: 'gallery-pin',
              trigger: section,
              pin: true,
              scrub: 1,
              start: 'top top',
              end: () => `+=${distance()}`,
              invalidateOnRefresh: true,
              snap: { snapTo: 1 / 9, duration: 0.25, ease: 'power1.inOut' },
            },
          });
        }
      }

      // ── Features ───────────────────────────────────────────────────────────────
      gsap.from('[data-anim="feature"]', {
        opacity: 0,
        y: 24,
        duration: 0.45,
        stagger: 0.06,
        scrollTrigger: { trigger: '[data-section="features"]', start: 'top 82%' },
      });

      return () => {
        for (const st of ScrollTrigger.getAll()) st.kill();
      };
    },
  );

  // Devanagari webfonts change line-box height on swap, which desyncs every pin.
  void document.fonts?.ready.then(() => ScrollTrigger.refresh());

  // ── Failsafe ────────────────────────────────────────────────────────────────
  // gsap.from() sets opacity to 0 the instant the tween is created. If its
  // ScrollTrigger then never fires — a mis-measure after a font swap, an unusual
  // viewport, a headless capture, a browser we did not anticipate — the content stays
  // invisible forever. On this product a blank section is indistinguishable from a
  // broken site, and the person looking at it may be in a hurry and frightened.
  //
  // So: a few seconds after load, anything still fully transparent is forced visible.
  // A missing animation is a cosmetic loss. Missing content is not.
  const failsafe = window.setTimeout(() => {
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-anim]'))) {
      if (Number(getComputedStyle(el).opacity) === 0) {
        gsap.set(el, { clearProps: 'all', opacity: 1, x: 0, y: 0, yPercent: 0 });
      }
    }
  }, 4000);

  return () => {
    window.clearTimeout(failsafe);
    mm.revert();
  };
}
