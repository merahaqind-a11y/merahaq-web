import matrix from './matrix.v2.json';
import type { Answers, CardId } from './types';

/**
 * THE diagnostic engine. One implementation, consumed by three shells.
 *
 * /shuru, the Sakhi chat widget and (later) the WhatsApp bot all import this exact
 * function. None of them re-implements the logic — a second implementation is exactly
 * how the three would quietly drift out of agreement with each other (PRD Appendix B).
 *
 * This module imports nothing but its matrix and its types. It must stay
 * framework-free so every shell and Vitest can import it unchanged.
 */

export const MATRIX_VERSION = matrix.v as 2;

const ALL_CARDS: readonly CardId[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9', 'C10'];

const UNIVERSAL = matrix.universal as CardId;
const TIE_BREAK = matrix.tieBreak as CardId[];
const FOUNDATION = matrix.foundation as CardId[];
const EXPLORER_DECK = matrix.explorer.deck as CardId[];
const PIN_ORDER = matrix.pinOrder as CardId[];
const WEIGHTS = matrix.weights as Record<string, Partial<Record<CardId, number>>>;

/** Options the UI must not render for these answers. F-20 / UF-12. */
export function hiddenOptions(a: Answers): string[] {
  return a.q1 === 'd' ? [...matrix.hideOptions['Q1==d']] : [];
}

/**
 * 1. GATE — cards excluded by life stage.
 * Gated cards are never deleted from the app; they remain in «सभी 10 कार्ड».
 * Gates only shape the personal tab. Personalisation curates, it never censors.
 */
function gated(a: Answers): Set<CardId> {
  const out = new Set<CardId>();
  if (a.q1 !== 'c') for (const c of matrix.gates['Q1!=c']) out.add(c as CardId);
  if (a.q1 === 'd') for (const c of matrix.gates['Q1==d']) out.add(c as CardId);
  return out;
}

/** 2. SCORE — S(c) = Σ W[q][a][c] over all answers, plus cross-rules X1–X3. */
function score(a: Answers): Map<CardId, number> {
  const s = new Map<CardId, number>();

  const add = (row: Partial<Record<CardId, number>> | undefined): void => {
    if (!row) return;
    for (const [card, w] of Object.entries(row)) {
      const id = card as CardId;
      s.set(id, (s.get(id) ?? 0) + (w ?? 0));
    }
  };

  if (a.q1) add(WEIGHTS[`Q1${a.q1}`]);
  if (a.q2) add(WEIGHTS[`Q2${a.q2}`]);
  if (a.q3) for (const t of a.q3) if (t !== 'f') add(WEIGHTS[`Q3${t}`]);
  if (a.q4) add(WEIGHTS[`Q4${a.q4}`]);

  // Q5 is inverse-scored. We ask what she HAS — positive, safe, ends the flow on
  // capability — and score what is MISSING. An unticked box is the signal.
  //
  // A skipped question contributes 0 everywhere, so `undefined` is deliberately not
  // the same as `[]`: skipping Q5 says nothing, whereas ticking nothing says she has
  // none of these things. «इनमें से कोई नहीं» applies all four absence rows at once.
  if (a.q5) {
    const none = a.q5.includes('e');
    const has = (k: 'a' | 'b' | 'c' | 'd'): boolean => !none && a.q5!.includes(k);
    if (!has('a')) add(WEIGHTS['Q5_no_bank']);
    if (!has('b')) add(WEIGHTS['Q5_no_papers']);
    if (!has('c')) add(WEIGHTS['Q5_no_sim']);
    if (!has('d')) add(WEIGHTS['Q5_no_list']);
  }

  // Cross-rules. Capped at five, forever — the moment this becomes a rules engine,
  // the matrix has failed.
  const t3 = (k: string): boolean => a.q3?.includes(k as never) ?? false;
  const q4Loan = a.q4 === 'b' || a.q4 === 'c' || a.q4 === 'd';

  if (a.q1 === 'c' && q4Loan) add({ C10: 2 }); // X1 widow + family loan
  if (a.q1 === 'e' && (t3('a') || t3('b'))) add({ C1: 1 }); // X2 divorced + streedhan
  if (t3('a') && t3('b')) add({ C1: 1 }); // X3 gifts AND dowry

  return s;
}

/**
 * 3. PIN — urgency overrides that jump the queue.
 * Order when both fire is C10, C9: agent harassment is hour-urgent (the 1930 golden
 * hour, the 30-day RBI clock); inheritance is important but not hourly.
 */
function pins(a: Answers): CardId[] {
  const fired = new Set<CardId>();
  if (a.q4 === 'd') fired.add(matrix.pins['Q4==d'] as CardId);
  if (a.q1 === 'c') fired.add(matrix.pins['Q1==c'] as CardId);
  return PIN_ORDER.filter((c) => fired.has(c));
}

/** 4. RANK — score descending, ties broken by the fixed priority order. */
function ranked(s: Map<CardId, number>, excluded: Set<CardId>): CardId[] {
  const tie = (c: CardId): number => {
    const i = TIE_BREAK.indexOf(c);
    return i < 0 ? Number.MAX_SAFE_INTEGER : i;
  };
  return ALL_CARDS.filter((c) => c !== UNIVERSAL && !excluded.has(c) && (s.get(c) ?? 0) > 0).sort(
    (x, y) => (s.get(y) ?? 0) - (s.get(x) ?? 0) || tie(x) - tie(y),
  );
}

/**
 * GATE → SCORE → PIN → RANK → FILL.
 *
 * Pure and total: the same answers always produce the same deck, the input is never
 * mutated, and the result is always exactly five distinct cards with C8 last.
 */
export function deck(a: Answers): CardId[] {
  const excluded = gated(a);
  const s = score(a);
  const pinned = pins(a).filter((c) => !excluded.has(c));
  const rank = ranked(s, excluded);

  let maxScore = 0;
  for (const c of rank) maxScore = Math.max(maxScore, s.get(c) ?? 0);

  const out: CardId[] = [];
  const push = (c: CardId): void => {
    if (out.length >= 4) return;
    if (c === UNIVERSAL || excluded.has(c) || out.includes(c)) return;
    out.push(c);
  };

  // Explorer mode: she disclosed nothing and nothing scored. Serve cards she can act
  // on TODAY without any dispute existing.
  const q3Silent = !a.q3 || a.q3.length === 0 || a.q3.includes('f');
  if (q3Silent && pinned.length === 0 && maxScore <= 2) {
    // The declared explorer deck is fixed, but gates still apply (owner decision D8).
    // An unmarried woman must not be shown C1 — that gate exists precisely to stop
    // marriage content breaking the "yes, they get me" spell.
    for (const c of EXPLORER_DECK) push(c);
  } else {
    for (const c of pinned) push(c);
    for (const c of rank) push(c);
  }

  // FILL. Three top-ups, in descending order of how well they fit her.
  for (const c of rank) push(c); // her own signal — covers the D8 gate collision
  for (const c of FOUNDATION) push(c); // minimum-floor rule, in the declared order
  for (const c of TIE_BREAK) push(c); // unreachable in practice; keeps deck() total

  out.push(UNIVERSAL); // C8 is unconditional and always last
  return out;
}
