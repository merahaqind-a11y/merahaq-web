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
 *
 * They are NEVER persisted — not to localStorage, not to Supabase, not anywhere.
 * If the phone is inspected there must be nothing to read. `prefs.ts` throws if
 * asked to write any of these fields.
 *
 * Every field is optional because `deck()` must stay total: deep-linked decks can
 * arrive partial, the WhatsApp bot will import the same function, and the acceptance
 * checklist requires an all-skipped fixture. The UI itself has no skip control
 * (owner decision D7) — skip-tolerance here is defensive, not a user-facing path.
 */
export interface Answers {
  q1?: Q1;
  q2?: Q2;
  q3?: Q3[];
  q4?: Q4;
  q5?: Q5[];
  /** Contributes zero weight to routing (RQ-7). Stored, never scored. */
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
