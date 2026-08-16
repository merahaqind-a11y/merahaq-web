import type { CardId, Lang, Prefs } from './types';
import { MATRIX_VERSION } from './deck';

/**
 * The ONLY module in the codebase that touches localStorage.
 *
 * What is stored: the output deck, the language, the region, and three UI flags.
 * What is never stored: her answers. Not here, not anywhere. If the phone is
 * inspected there must be nothing to read — that is the whole point of computing the
 * deck client-side and throwing the answers away.
 *
 * The key is deliberately innocuous. Someone glancing at devtools sees `mh_prefs`.
 */

const KEY = 'mh_prefs';

/** Fields that would leak her answers. Writing any of these is a bug, so it throws. */
const FORBIDDEN = ['q1', 'q2', 'q3', 'q4', 'q5', 'answers', 'responses'];

const DEFAULTS: Prefs = {
  deck: [],
  v: MATRIX_VERSION,
  lang: 'hi',
  muted: false,
  seenAudioNote: false,
  seenLoginSheet: false,
};

/**
 * UF-15: when localStorage is blocked (private mode), the deck is held in memory for
 * the session and the flow continues with a one-line note. It never fails.
 */
let memory: Prefs = { ...DEFAULTS };
let blocked = false;

export function storageBlocked(): boolean {
  return blocked;
}

export function readPrefs(): Prefs {
  if (blocked) return { ...memory };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    blocked = true;
    return { ...memory };
  }
}

export function writePrefs(patch: Partial<Prefs>): void {
  for (const field of FORBIDDEN) {
    if (field in (patch as Record<string, unknown>)) {
      throw new Error(`prefs: refusing to persist answer field "${field}"`);
    }
  }
  const next: Prefs = { ...readPrefs(), ...patch };
  memory = next;
  if (blocked) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    blocked = true;
  }
}

export function clearPrefs(): void {
  memory = { ...DEFAULTS };
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* memory is already reset */
  }
}

export function getDeck(): CardId[] {
  return readPrefs().deck;
}

export function hasDeck(): boolean {
  return readPrefs().deck.length > 0;
}

export function getLang(): Lang {
  return readPrefs().lang;
}

export function isMuted(): boolean {
  return readPrefs().muted;
}
