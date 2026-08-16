import { describe, expect, it } from 'vitest';
import { deck, hiddenOptions, MATRIX_VERSION } from '../src/lib/deck';
import type { Answers, Q1, Q2, Q3, Q4, Q5 } from '../src/lib/types';

describe('matrix', () => {
  it('is version 2', () => {
    expect(MATRIX_VERSION).toBe(2);
  });
});

describe('worked examples from Diagnostic Spec §4', () => {
  // A. Married & cohabiting · earns but hands over salary · ticks "gehne mile" +
  //    "maangna padta hai" · no loan · has papers and SIM, no bank account, no jewellery list.
  //    Scores → C2: 5 · C6: 5 · C1: 4 · C3: 1 · C4: 1
  it('A → [C2, C6, C1, C3, C8]', () => {
    expect(deck({ q1: 'a', q2: 'b', q3: ['a', 'e'], q4: 'a', q5: ['b', 'c'] })).toEqual([
      'C2', 'C6', 'C1', 'C3', 'C8',
    ]);
  });

  // B. Widow · no steady income · ticks "ghar mere naam par nahin" + "maangna padta hai"
  //    · husband's loan pending · nothing ticked on Q5.
  //    Pins → C9. Scores → C7: 5 · C6: 5 · C10: 4 (incl. X1) · C3: 3 · C2: 2 · C4: 2 · C1: 1
  it('B → [C9, C6, C7, C10, C8]', () => {
    expect(deck({ q1: 'c', q2: 'e', q3: ['c', 'e'], q4: 'b', q5: [] })).toEqual([
      'C9', 'C6', 'C7', 'C10', 'C8',
    ]);
  });

  // C. Unmarried · earns and keeps · ticks "maayke mein zameen hai" (a, b hidden)
  //    · no loans · has bank + SIM, papers with family.
  //    Gates → C1, C4, C9 out. Scores → C5: 4 · C7: 4 · C6: 2. C2 arrives via foundation fill.
  //    The C5/C7 tie is the case that required owner decision D6.
  it('C → [C5, C7, C6, C2, C8]', () => {
    expect(deck({ q1: 'd', q2: 'a', q3: ['d'], q4: 'a', q5: ['a', 'c'] })).toEqual([
      'C5', 'C7', 'C6', 'C2', 'C8',
    ]);
  });
});

describe('explorer mode', () => {
  it('Q3=f with no pins and maxScore<=2 serves the foundation deck', () => {
    expect(deck({ q1: 'a', q2: 'a', q3: ['f'], q4: 'a', q5: ['a', 'b', 'c', 'd'] })).toEqual([
      'C6', 'C7', 'C2', 'C1', 'C8',
    ]);
  });

  it('every question skipped serves the foundation deck', () => {
    expect(deck({})).toEqual(['C6', 'C7', 'C2', 'C1', 'C8']);
  });

  // Owner decision D8. Reachable with no skip at all: Q1d gates C1 out of the fixed
  // explorer deck, which would otherwise return four cards under a screen that says
  // «ये 5 कार्ड आपके लिए हैं». C5 is the card her own answer pointed at.
  it('gate-filters and tops up when the explorer deck collides with a gate', () => {
    const d = deck({ q1: 'd', q2: 'a', q3: ['f'], q4: 'a', q5: ['a', 'b', 'c', 'd'] });
    expect(d).toEqual(['C6', 'C7', 'C2', 'C5', 'C8']);
    expect(d).not.toContain('C1');
  });
});

describe('gates', () => {
  it('excludes C9 for anyone who is not widowed', () => {
    for (const q1 of ['a', 'b', 'd', 'e'] as Q1[]) {
      expect(deck({ q1, q2: 'd', q3: ['c', 'e'], q4: 'c', q5: [] }), q1).not.toContain('C9');
    }
  });

  it('excludes C1 and C4 for an unmarried woman', () => {
    const d = deck({ q1: 'd', q2: 'd', q3: ['d'], q4: 'c', q5: [] });
    expect(d).not.toContain('C1');
    expect(d).not.toContain('C4');
  });

  it('hides Q3 statements a and b when Q1=d', () => {
    expect(hiddenOptions({ q1: 'd' })).toEqual(['Q3a', 'Q3b']);
    expect(hiddenOptions({ q1: 'a' })).toEqual([]);
    expect(hiddenOptions({})).toEqual([]);
  });
});

describe('pins', () => {
  it('pins C10 first when recovery agents are active', () => {
    const d = deck({ q1: 'a', q2: 'a', q3: ['a'], q4: 'd', q5: ['a', 'b', 'c', 'd'] });
    expect(d[0]).toBe('C10');
  });

  it('pins C9 first for a widow', () => {
    const d = deck({ q1: 'c', q2: 'a', q3: ['c'], q4: 'a', q5: ['a', 'b', 'c', 'd'] });
    expect(d[0]).toBe('C9');
  });

  // Agent harassment is hour-urgent — the 1930 golden hour, the 30-day RBI clock.
  // Inheritance is important but not hourly.
  it('orders C10 before C9 when both fire', () => {
    const d = deck({ q1: 'c', q2: 'a', q3: ['c'], q4: 'd', q5: ['a', 'b', 'c', 'd'] });
    expect(d[0]).toBe('C10');
    expect(d[1]).toBe('C9');
  });
});

describe('cross-rules', () => {
  it('X1 lifts C10 for a widow with a family loan', () => {
    expect(deck({ q1: 'c', q2: 'e', q3: ['c', 'e'], q4: 'b', q5: [] })).toContain('C10');
  });

  it('X2 lifts C1 for a divorced woman who ticked a streedhan statement', () => {
    // Q1e: C1 2, C4 3, C5 1. Q3a: C1 2. X2: C1 +1 → C1 = 5, above C4's 3.
    const d = deck({ q1: 'e', q2: 'a', q3: ['a'], q4: 'a', q5: ['a', 'b', 'c', 'd'] });
    expect(d[0]).toBe('C1');
  });

  it('X3 lifts C1 when both streedhan statements are ticked', () => {
    // Q1a: C1 1, C3 1. Q3a+Q3b: C1 4. X3: C1 +1 → C1 = 6, the clear top score.
    const d = deck({ q1: 'a', q2: 'a', q3: ['a', 'b'], q4: 'a', q5: ['a', 'b', 'c', 'd'] });
    expect(d[0]).toBe('C1');
  });
});

describe('Q5 inverse scoring', () => {
  // The inversion is the trick: we ask what she HAS, and score what is missing.
  // A skipped question contributes 0 everywhere, so `undefined` is not the same as `[]`.
  it('treats an unticked box as the signal', () => {
    const hasAll = deck({ q1: 'a', q2: 'a', q3: ['a'], q4: 'a', q5: ['a', 'b', 'c', 'd'] });
    const hasNone = deck({ q1: 'a', q2: 'a', q3: ['a'], q4: 'a', q5: [] });
    expect(hasNone).not.toEqual(hasAll);
    expect(hasNone).toContain('C6'); // no bank account → C6 +3
    expect(hasNone).toContain('C7'); // no papers → C7 +3
  });

  it('«इनमें से कोई नहीं» applies all four absence rows at once', () => {
    expect(deck({ q1: 'a', q2: 'a', q3: ['a'], q4: 'a', q5: ['e'] })).toEqual(
      deck({ q1: 'a', q2: 'a', q3: ['a'], q4: 'a', q5: [] }),
    );
  });

  it('a skipped Q5 contributes nothing, unlike an empty Q5', () => {
    const skipped = deck({ q1: 'a', q2: 'a', q3: ['a'], q4: 'a' });
    const empty = deck({ q1: 'a', q2: 'a', q3: ['a'], q4: 'a', q5: [] });
    expect(skipped).not.toEqual(empty);
  });
});

describe('invariants — hold for every reachable answer combination', () => {
  const Q1S: (Q1 | undefined)[] = ['a', 'b', 'c', 'd', 'e', undefined];
  const Q2S: (Q2 | undefined)[] = ['a', 'b', 'c', 'd', 'e', undefined];
  const Q4S: (Q4 | undefined)[] = ['a', 'b', 'c', 'd', 'e', undefined];
  const Q3S: (Q3[] | undefined)[] = [
    ['a'], ['b'], ['c'], ['d'], ['e'], ['f'], ['a', 'b'], ['a', 'b', 'c', 'd', 'e'], [], undefined,
  ];
  const Q5S: (Q5[] | undefined)[] = [
    ['a'], ['b'], ['c'], ['d'], ['e'], ['a', 'b', 'c', 'd'], ['a', 'c'], [], undefined,
  ];

  function* every(): Generator<Answers> {
    for (const q1 of Q1S) {
      for (const q2 of Q2S) {
        for (const q3 of Q3S) {
          for (const q4 of Q4S) {
            for (const q5 of Q5S) yield { q1, q2, q3, q4, q5 };
          }
        }
      }
    }
  }

  it('always returns exactly 5 distinct cards with C8 last', () => {
    let n = 0;
    for (const a of every()) {
      const d = deck(a);
      const ctx = JSON.stringify(a);
      expect(d, ctx).toHaveLength(5);
      expect(new Set(d).size, ctx).toBe(5);
      expect(d[4], ctx).toBe('C8');
      n++;
    }
    expect(n).toBeGreaterThan(15_000);
  });

  it('never returns a gated card', () => {
    for (const a of every()) {
      const d = deck(a);
      const ctx = JSON.stringify(a);
      if (a.q1 !== 'c') expect(d, ctx).not.toContain('C9');
      if (a.q1 === 'd') {
        expect(d, ctx).not.toContain('C1');
        expect(d, ctx).not.toContain('C4');
      }
    }
  });

  it('is pure — the same answers always produce the same deck', () => {
    for (const a of every()) expect(deck(a)).toEqual(deck(a));
  });

  it('does not mutate the answers it is given', () => {
    const a: Answers = { q1: 'a', q2: 'b', q3: ['a', 'e'], q4: 'a', q5: ['b', 'c'] };
    const before = JSON.stringify(a);
    deck(a);
    expect(JSON.stringify(a)).toBe(before);
  });

  it('ignores region entirely (RQ-7: region contributes zero weight)', () => {
    const base: Answers = { q1: 'a', q2: 'b', q3: ['a', 'e'], q4: 'a', q5: ['b', 'c'] };
    for (const region of ['north', 'south', 'east', 'west', 'central', 'unknown'] as const) {
      expect(deck({ ...base, region }), region).toEqual(deck(base));
    }
  });
});
