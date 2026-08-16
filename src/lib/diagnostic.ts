import type { Answers } from './types';

/**
 * The five questions, as data.
 *
 * Wording is FROZEN by the Diagnostic Spec §2 and copied verbatim through the i18n
 * keys — it is not improved here, ever. Question order is deliberate: easiest first,
 * most personal in the middle, ending on agency, so she finishes the flow feeling
 * capable rather than exposed.
 */

export type ScreenId = 's0' | 's0b' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 's6' | 's7';

export interface OptionDef {
  /** Option letter, as used by the weight matrix. */
  id: string;
  /** i18n key for the label. */
  key: string;
  /** Icon name — see ICONS below. */
  icon: IconName;
}

export interface QuestionDef {
  id: 'q1' | 'q2' | 'q3' | 'q4' | 'q5';
  questionKey: string;
  hintKey?: string;
  ctaKey?: string;
  multi: boolean;
  options: OptionDef[];
}

export type IconName =
  | 'home' | 'suitcase' | 'heart' | 'flower' | 'rings'
  | 'strength' | 'exchange' | 'handshake' | 'blocked' | 'cloud'
  | 'ring' | 'gift' | 'field' | 'coins' | 'minus'
  | 'check' | 'bank' | 'sign' | 'phone' | 'question'
  | 'papers' | 'mobile' | 'camera';

/**
 * Line icons, not emoji.
 *
 * The Diagnostic Spec lists an emoji per option, and the intent — a pictogram beside
 * every option for a woman who reads slowly — is exactly right. Emoji are the wrong
 * implementation of it: they render differently on every Android skin (the same
 * codepoint can be a different picture on her phone than on the facilitator's), some
 * are missing entirely on older builds and show as tofu, and a screen reader announces
 * them by CLDR name, which for these options ranges from noise to actively misleading.
 *
 * These carry the same meanings as the spec's emoji, render identically everywhere,
 * inherit colour, and are aria-hidden so the option label is the accessible name.
 */
export const ICONS: Record<IconName, string> = {
  home: 'M4 11l8-6 8 6M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9',
  suitcase: 'M4 8h16v11a1 1 0 01-1 1H5a1 1 0 01-1-1V8zm5 0V5a1 1 0 011-1h4a1 1 0 011 1v3',
  heart: 'M12 20s-7-4.4-7-9a4 4 0 017-2.6A4 4 0 0119 11c0 4.6-7 9-7 9z',
  flower: 'M12 9a3 3 0 110 6 3 3 0 010-6zM12 9V4M12 15v5M9 12H4M15 12h5',
  rings: 'M9 15a4 4 0 100-8 4 4 0 000 8zM17 17a4 4 0 100-8 4 4 0 000 8z',
  strength: 'M6 14a6 6 0 0112 0M9 20v-6M15 20v-6M12 4v4',
  exchange: 'M4 9h13l-3-3M20 15H7l3 3',
  handshake: 'M8 12l3-3 3 3 3-3M4 10l4-4 4 4M20 10l-4-4M6 14l4 4 4-4 4-4',
  blocked: 'M12 21a9 9 0 100-18 9 9 0 000 18zM6 6l12 12',
  cloud: 'M6 18h11a4 4 0 000-8 6 6 0 00-11.3 2A3.5 3.5 0 006 18z',
  ring: 'M12 21a6 6 0 100-12 6 6 0 000 12zM9 6l3-3 3 3-3 2.5L9 6z',
  gift: 'M3 10h18v3H3v-3zm2 3v8h14v-8M12 10v11M12 10S9 4 6.5 5.5 9 10 12 10zm0 0s3-6 5.5-4.5S15 10 12 10z',
  field: 'M3 19h18M5 19V9l7-4 7 4v10M9 19v-5h6v5',
  coins: 'M9 12a5 3 0 100-6 5 3 0 000 6zM4 9v6c0 1.7 2.2 3 5 3s5-1.3 5-3V9M14 12.5c2.4-.3 4-1.4 4-2.5M20 10v6c0 1.7-2.2 3-5 3-.7 0-1.4-.1-2-.2',
  minus: 'M5 12h14',
  check: 'M4.5 12.5l5 5 10-11',
  bank: 'M3 10l9-5 9 5M5 10v7M10 10v7M14 10v7M19 10v7M3 20h18',
  sign: 'M4 18c3-1 4-9 7-9s2 6 4 6 3-3 5-3M4 21h16',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z',
  question: 'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5A2.5 2.5 0 1112 12v2M12 17.5v.01',
  papers: 'M8 4h8l3 3v11a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2zM9 11h7M9 15h5',
  mobile: 'M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zM11 18h2',
  camera: 'M4 8h3l1.5-2h7L17 8h3v11H4V8zm8 8.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
};

export const QUESTIONS: QuestionDef[] = [
  {
    id: 'q1',
    questionKey: 'q1.question',
    multi: false,
    options: [
      { id: 'a', key: 'q1.a', icon: 'home' },
      { id: 'b', key: 'q1.b', icon: 'suitcase' },
      { id: 'c', key: 'q1.c', icon: 'heart' },
      { id: 'd', key: 'q1.d', icon: 'flower' },
      { id: 'e', key: 'q1.e', icon: 'rings' },
    ],
  },
  {
    id: 'q2',
    questionKey: 'q2.question',
    multi: false,
    options: [
      { id: 'a', key: 'q2.a', icon: 'strength' },
      { id: 'b', key: 'q2.b', icon: 'exchange' },
      { id: 'c', key: 'q2.c', icon: 'handshake' },
      { id: 'd', key: 'q2.d', icon: 'blocked' },
      { id: 'e', key: 'q2.e', icon: 'cloud' },
    ],
  },
  {
    id: 'q3',
    questionKey: 'q3.question',
    hintKey: 'q3.hint',
    ctaKey: 'q3.cta',
    multi: true,
    options: [
      { id: 'a', key: 'q3.a', icon: 'ring' },
      { id: 'b', key: 'q3.b', icon: 'gift' },
      { id: 'c', key: 'q3.c', icon: 'home' },
      { id: 'd', key: 'q3.d', icon: 'field' },
      { id: 'e', key: 'q3.e', icon: 'coins' },
      { id: 'f', key: 'q3.f', icon: 'minus' },
    ],
  },
  {
    id: 'q4',
    questionKey: 'q4.question',
    multi: false,
    options: [
      { id: 'a', key: 'q4.a', icon: 'check' },
      { id: 'b', key: 'q4.b', icon: 'bank' },
      { id: 'c', key: 'q4.c', icon: 'sign' },
      { id: 'd', key: 'q4.d', icon: 'phone' },
      { id: 'e', key: 'q4.e', icon: 'question' },
    ],
  },
  {
    id: 'q5',
    questionKey: 'q5.question',
    hintKey: 'q5.hint',
    ctaKey: 'q5.cta',
    multi: true,
    options: [
      { id: 'a', key: 'q5.a', icon: 'bank' },
      { id: 'b', key: 'q5.b', icon: 'papers' },
      { id: 'c', key: 'q5.c', icon: 'mobile' },
      { id: 'd', key: 'q5.d', icon: 'camera' },
      { id: 'e', key: 'q5.e', icon: 'minus' },
    ],
  },
];

export const REGIONS = [
  { id: 'north', key: 's0b.north' },
  { id: 'south', key: 's0b.south' },
  { id: 'east', key: 's0b.east' },
  { id: 'west', key: 's0b.west' },
  { id: 'central', key: 's0b.central' },
  { id: 'unknown', key: 's0b.unknown' },
] as const;

/** Single-selects auto-advance this many ms after the highlight (F-18). */
export const AUTO_ADVANCE_MS = 400;

/** S6 is purely psychological — the computation is instant (F-22). */
export const PROCESSING_MS = 1500;

export type { Answers };
