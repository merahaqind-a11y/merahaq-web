import { describe, expect, it } from 'vitest';
import { UI, LANGS, t, DEFAULT_LANG } from '../src/lib/i18n';

/**
 * The copy rules are not style guidance here — they are the difference between a woman
 * reading a screen and giving up on it. So they are enforced mechanically rather than
 * left to review.
 */

/**
 * Strings frozen verbatim by the PRD or the Diagnostic Spec. These are exempt from the
 * sentence-length rule because we do not have authorial control over them: the PRD says
 * copy them exactly and do not improve them. Every OTHER string must obey the rule.
 */
const FROZEN = new Set([
  'hero.question',
  'hero.sub',
  'cta.primary',
  'cta.allCards',
  's0.title',
  's0b.question',
  's0b.note',
  'q1.question', 'q1.a', 'q1.b', 'q1.c', 'q1.d', 'q1.e',
  'q2.question', 'q2.a', 'q2.b', 'q2.c', 'q2.d', 'q2.e',
  'q3.question', 'q3.hint', 'q3.a', 'q3.b', 'q3.c', 'q3.d', 'q3.e', 'q3.f', 'q3.cta',
  'q4.question', 'q4.a', 'q4.b', 'q4.c', 'q4.d', 'q4.e',
  'q5.question', 'q5.hint', 'q5.a', 'q5.b', 'q5.c', 'q5.d', 'q5.e', 'q5.cta',
  's6.title', 's7.title', 's7.open', 's7.universal',
  'sunie.note', 'sunie.noteTip',
  'footer.disclaimer',
  'sharedPhone',
]);

const entries = Object.entries(UI);

describe('completeness', () => {
  it('has keys', () => {
    expect(entries.length).toBeGreaterThan(80);
  });

  it('every key has all three languages, none empty', () => {
    for (const [key, v] of entries) {
      for (const lang of LANGS) {
        expect(v[lang], `${key}.${lang} missing`).toBeTruthy();
        expect(v[lang].trim().length, `${key}.${lang} empty`).toBeGreaterThan(0);
      }
    }
  });

  it('t() returns Hindi by default and throws on an unknown key', () => {
    expect(t('cta.primary')).toBe(UI['cta.primary']!.hi);
    expect(DEFAULT_LANG).toBe('hi');
    expect(() => t('nope.not.a.key')).toThrow();
  });
});

describe('the Hindi track', () => {
  const DEVANAGARI = /[ऀ-ॿ]/;
  // A handful of keys are numerals or Latin script codes in every track.
  const NON_DEVANAGARI_OK = new Set(['lang.short.hinglish', 'lang.short.en']);

  it('is Devanagari, not transliteration', () => {
    for (const [key, v] of entries) {
      if (NON_DEVANAGARI_OK.has(key)) continue;
      expect(DEVANAGARI.test(v.hi), `${key}.hi is not Devanagari: ${v.hi}`).toBe(true);
    }
  });

  it('uses bazaar vocabulary — no Sanskritised words', () => {
    // Diagnostic Spec §6. हक़ not अधिकार, काग़ज़ not दस्तावेज़.
    const BANNED = ['अधिकार', 'दस्तावेज़', 'संपत्ति', 'उत्पीड़न', 'आर्थिक', 'स्थिति'];
    for (const [key, v] of entries) {
      for (const word of BANNED) {
        expect(v.hi.includes(word), `${key}.hi uses banned word "${word}"`).toBe(false);
      }
    }
  });

  it('keeps authored sentences to twelve words or fewer', () => {
    for (const [key, v] of entries) {
      if (FROZEN.has(key)) continue;
      for (const sentence of v.hi.split(/[।?!]/)) {
        const words = sentence.trim().split(/\s+/).filter(Boolean);
        expect(
          words.length,
          `${key}.hi sentence is ${words.length} words: "${sentence.trim()}"`,
        ).toBeLessThanOrEqual(12);
      }
    }
  });

  it('every frozen string is actually present in the schema', () => {
    for (const key of FROZEN) {
      expect(UI[key], `frozen key "${key}" is missing — did it get renamed?`).toBeTruthy();
    }
  });
});

describe('the English track', () => {
  it('is authored plain English, not transliterated Hindi (PRD §5.11 r5)', () => {
    const TELLS = /\b(aapke|aapka|aapki|hain|karein|kijiye|dekhein|jaayein|nahin|kholein|batao)\b/i;
    for (const [key, v] of entries) {
      // The language pill legitimately labels the Hinglish option in Latin script.
      if (key.startsWith('lang.')) continue;
      expect(TELLS.test(v.en), `${key}.en reads as transliteration: ${v.en}`).toBe(false);
    }
  });

  it('never leaves a Devanagari string sitting in the English track', () => {
    for (const [key, v] of entries) {
      expect(/[ऀ-ॿ]/.test(v.en), `${key}.en contains Devanagari: ${v.en}`).toBe(false);
    }
  });
});

describe('safety rules the copy itself must satisfy', () => {
  it('never suggests confrontation, in any language', () => {
    const HI = ['माँग करें', 'लड़ें', 'झगड़ा', 'विरोध करें', 'धमकी', 'शिकायत करो'];
    const EN = ['demand', 'confront', 'fight', 'threaten', 'accuse'];
    for (const [key, v] of entries) {
      for (const w of HI) expect(v.hi.includes(w), `${key}.hi: "${w}"`).toBe(false);
      for (const w of EN) {
        expect(v.en.toLowerCase().includes(w), `${key}.en: "${w}"`).toBe(false);
      }
    }
  });

  it('never labels her situation — no accusatory or diagnostic framing', () => {
    // Tab and menu labels in particular must stay neutral. Never «आपकी समस्याएँ».
    const BANNED = ['समस्या', 'पीड़ित', 'शिकार'];
    for (const [key, v] of entries) {
      for (const w of BANNED) expect(v.hi.includes(w), `${key}.hi: "${w}"`).toBe(false);
    }
  });

  it('offers information, never advice', () => {
    expect(UI['footer.disclaimer']!.hi).toBe('यह जानकारी है, सलाह नहीं');
  });

  it('the reveal screen headline never references her answers', () => {
    // S7 must be clean if seen over her shoulder. No "kyunki aapne bataya ki…".
    for (const key of ['s7.title', 's7.open', 's7.universal']) {
      for (const lang of LANGS) {
        expect(UI[key]![lang].includes('क्योंकि')).toBe(false);
        expect(UI[key]![lang].toLowerCase().includes('because')).toBe(false);
      }
    }
  });
});
