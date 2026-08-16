import { UI, LANGS, DEFAULT_LANG } from './i18n';
import { CARDS } from './cards';
import { readPrefs, writePrefs } from './prefs';
import type { CardId, Lang } from './types';

/**
 * The language switch (F-110).
 *
 * Requirements it has to satisfy, all of them at once:
 *   · instant, client-side, no page reload
 *   · no loss of progress — switching on Q3 re-renders Q3 in the new language with
 *     her answers so far intact
 *   · present and identical on every page
 *   · persisted to localStorage, never inferred from browser locale (F-112)
 *   · `<html lang>` updates so screen readers and TTS pick the right voice (r7)
 *
 * It works by rewriting text in place rather than re-rendering anything. Her answers
 * live in the diagnostic's closure and are never touched, which is what makes
 * "no loss of progress" true by construction rather than by careful bookkeeping.
 */

/** The word carrying the emphasis weight in the hero headline, per track. */
const EMPH: Record<Lang, string> = { hi: 'हक़', hinglish: 'haq', en: 'belong' };

function isEmph(word: string, lang: Lang): boolean {
  return word.toLowerCase().replace(/[?,.]/g, '').includes(EMPH[lang].toLowerCase());
}

/**
 * Rebuild a hand-split headline. The hero splits its words into spans so GSAP can
 * stagger them without SplitText; those spans have no data-i18n of their own, so a
 * plain text swap would silently leave the headline in the old language.
 */
function applySplit(el: HTMLElement, lang: Lang): void {
  const key = el.dataset['i18nSplit'];
  const entry = key ? UI[key] : undefined;
  if (!entry) return;

  el.textContent = '';
  const words = entry[lang].split(' ');
  words.forEach((word, i) => {
    const clip = document.createElement('span');
    clip.className = 'inline-block overflow-hidden align-bottom';
    const inner = document.createElement('span');
    inner.className = isEmph(word, lang) ? 'inline-block emph' : 'inline-block';
    inner.dataset['anim'] = 'hero-word';
    inner.textContent = word;
    clip.append(inner);
    el.append(clip);
    if (i < words.length - 1) el.append(document.createTextNode(' '));
  });
}

export function applyLang(lang: Lang): void {
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-i18n]'))) {
    const key = el.dataset['i18n'];
    const entry = key ? UI[key] : undefined;
    if (entry) el.textContent = entry[lang];
  }

  for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-i18n-label]'))) {
    const key = el.dataset['i18nLabel'];
    const entry = key ? UI[key] : undefined;
    if (entry) el.setAttribute('aria-label', entry[lang]);
  }

  for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-i18n-split]'))) {
    applySplit(el, lang);
  }

  // Card titles and summaries are content, not chrome, so they live in the card
  // registry rather than the UI schema — but they still have to switch.
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-card-title]'))) {
    const card = CARDS[el.dataset['cardTitle'] as CardId];
    if (card) el.textContent = card.title[lang];
  }
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-card-summary]'))) {
    const card = CARDS[el.dataset['cardSummary'] as CardId];
    if (card) el.textContent = card.summary[lang];
  }

  const html = document.documentElement;
  // Hindi and Hinglish are the same spoken language in different scripts, so both
  // declare hi — TTS should speak Hinglish aloud in Hindi, not read it as English.
  html.lang = lang === 'en' ? 'en' : 'hi';
  html.dataset['mhLang'] = lang;

  for (const btn of Array.from(document.querySelectorAll<HTMLElement>('[data-lang]'))) {
    btn.setAttribute('aria-pressed', String(btn.dataset['lang'] === lang));
  }
}

export function setLang(lang: Lang): void {
  applyLang(lang);
  writePrefs({ lang });
  document.dispatchEvent(new CustomEvent('mh:langchange', { detail: lang }));
}

export function initLang(): void {
  // Always an explicit, stored choice — never inferred from browser locale or IP.
  const stored = readPrefs().lang;
  const lang: Lang = LANGS.includes(stored) ? stored : DEFAULT_LANG;
  applyLang(lang);

  document.addEventListener('click', (ev) => {
    const btn = (ev.target as HTMLElement).closest<HTMLElement>('[data-lang]');
    if (!btn) return;
    ev.preventDefault();
    setLang(btn.dataset['lang'] as Lang);
  });
}
