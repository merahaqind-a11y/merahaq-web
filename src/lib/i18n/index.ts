import ui from './ui.json';
import type { Lang } from '../types';

export const UI = ui as Record<string, Record<Lang, string>>;

export const LANGS: readonly Lang[] = ['hi', 'hinglish', 'en'];

/** Always Hindi on first visit. Never inferred from locale or IP (F-112). */
export const DEFAULT_LANG: Lang = 'hi';

export function t(key: string, lang: Lang = DEFAULT_LANG): string {
  const entry = UI[key];
  if (!entry) throw new Error(`i18n: unknown key "${key}"`);
  return entry[lang];
}

/** All three languages for one key — used to inline a switchable string into static HTML. */
export function all(key: string): Record<Lang, string> {
  const entry = UI[key];
  if (!entry) throw new Error(`i18n: unknown key "${key}"`);
  return entry;
}

/**
 * Instant, client-side, no reload, no loss of progress (F-110 r2).
 *
 * Chrome strings are inlined in all three languages and swapped in place, so a switch
 * mid-diagnostic costs zero network and cannot lose her answers. Card body content is
 * fetched on first switch and service-worker cached after.
 *
 * `<html lang>` is updated so screen readers and browser TTS pick the right voice
 * (F-110 r7), and so the `:lang(hi)` rule keeps Mukta emphasis capped at 700.
 */
export function applyLang(lang: Lang, root: ParentNode = document): void {
  for (const el of Array.from(root.querySelectorAll<HTMLElement>('[data-i18n]'))) {
    const key = el.dataset['i18n'];
    const entry = key ? UI[key] : undefined;
    if (entry) el.textContent = entry[lang];
  }

  for (const el of Array.from(root.querySelectorAll<HTMLElement>('[data-i18n-label]'))) {
    const key = el.dataset['i18nLabel'];
    const entry = key ? UI[key] : undefined;
    if (entry) el.setAttribute('aria-label', entry[lang]);
  }

  const html = document.documentElement;
  // Hindi and Hinglish are the same spoken language in different scripts, so both
  // declare hi — TTS should speak Hinglish aloud in Hindi, not read it as English.
  html.lang = lang === 'en' ? 'en' : 'hi';
  html.dataset['mhLang'] = lang;
}
