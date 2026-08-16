import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Contrast is a safety requirement here, not a compliance checkbox. This audience
 * reads Devanagari slowly on a cheap LCD at low brightness, often outdoors. Every
 * pairing the design system actually uses is asserted, and pink-500 is locked out of
 * text roles because it fails.
 */

const TOKENS = readFileSync('src/styles/tokens.css', 'utf8');

function token(name: string): string {
  const m = TOKENS.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m?.[1]) throw new Error(`token --color-${name} not found in tokens.css`);
  return m[1].toUpperCase();
}

/** WCAG 2.x relative luminance. */
function luminance(hex: string): number {
  const channel = (i: number): number => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5;

describe('token values match the locked palette', () => {
  const LOCKED: Record<string, string> = {
    'pink-700': '#9A1348',
    'pink-600': '#D6336C',
    'pink-500': '#FF4081',
    'pink-200': '#FFB6C1',
    'pink-050': '#FFF5F8',
    'blue-800': '#0D47A1',
    'blue-600': '#1565C0',
    'blue-050': '#E3F2FD',
    ink: '#1F2A44',
    text: '#2B2B2B',
    muted: '#595959',
    bg: '#F4F5F7',
    surface: '#FFFFFF',
    border: '#DDDDDD',
    'green-700': '#2E7D32',
    'green-050': '#EAF3EB',
    'red-700': '#B3261E',
    'red-050': '#FDECEA',
  };

  for (const [name, hex] of Object.entries(LOCKED)) {
    it(`--color-${name} is ${hex}`, () => {
      expect(token(name)).toBe(hex);
    });
  }
});

describe('every pairing the system uses passes AA', () => {
  const PAIRS: [string, string, string][] = [
    ['pink action text on white', 'pink-600', 'surface'],
    // On the tinted canvas pink text steps down to 700 — see the step-down rule below.
    ['pink text on canvas', 'pink-700', 'bg'],
    ['pink text on pink tint', 'pink-700', 'pink-050'],
    ['pink hover on white', 'pink-700', 'surface'],
    ['blue sarkari on white', 'blue-600', 'surface'],
    ['blue sarkari on canvas', 'blue-600', 'bg'],
    ['blue sarkari on blue tint', 'blue-600', 'blue-050'],
    ['blue hover on white', 'blue-800', 'surface'],
    ['ink heading on white', 'ink', 'surface'],
    ['ink heading on canvas', 'ink', 'bg'],
    ['ink heading on pink tint', 'ink', 'pink-050'],
    ['body text on white', 'text', 'surface'],
    ['body text on canvas', 'text', 'bg'],
    ['body text on pink tint', 'text', 'pink-050'],
    ['muted on white', 'muted', 'surface'],
    ['muted on canvas', 'muted', 'bg'],
    ['sahi-hai confirmation', 'green-700', 'green-050'],
    ['galat-hai verdict', 'red-700', 'red-050'],
    ['green on white', 'green-700', 'surface'],
    ['red on white', 'red-700', 'surface'],
  ];

  for (const [label, fg, bg] of PAIRS) {
    it(`${label} — ${fg} on ${bg}`, () => {
      expect(ratio(token(fg), token(bg))).toBeGreaterThanOrEqual(AA);
    });
  }

  it('white on the dark chapter', () => {
    expect(ratio('#FFFFFF', token('ink'))).toBeGreaterThanOrEqual(AA);
  });

  it('pink-200 accents on the dark chapter', () => {
    expect(ratio(token('pink-200'), token('ink'))).toBeGreaterThanOrEqual(AA);
  });

  it('white label on the pink action surface', () => {
    expect(ratio('#FFFFFF', token('pink-600'))).toBeGreaterThanOrEqual(AA);
  });

  it('white label on the blue sarkari surface', () => {
    expect(ratio('#FFFFFF', token('blue-600'))).toBeGreaterThanOrEqual(AA);
  });
});

describe('the pink step-down rule', () => {
  // Measured, not assumed. The brief states pink-600 is "AA on white (4.75:1)" and it
  // is — on PURE white. The page canvas is #F4F5F7, and pink-600 on it is 4.23:1,
  // which fails. Hence: pink-600 as a fill anywhere, as text on --surface only; on any
  // tinted ground pink text steps down to pink-700. These two assertions record the
  // measurement so the rule cannot be quietly "simplified" away later.
  it('pink-600 as text on the tinted canvas fails AA — this is why 700 exists', () => {
    expect(ratio(token('pink-600'), token('bg'))).toBeLessThan(AA);
  });

  it('pink-600 as a fill with white text passes AA, so fills are unrestricted', () => {
    expect(ratio('#FFFFFF', token('pink-600'))).toBeGreaterThanOrEqual(AA);
  });

  it('pink-700 clears AA on every ground the system uses', () => {
    for (const bg of ['surface', 'bg', 'pink-050', 'blue-050', 'green-050', 'red-050']) {
      expect(ratio(token('pink-700'), token(bg)), bg).toBeGreaterThanOrEqual(AA);
    }
  });
});

describe('pink-500 is decorative only', () => {
  // #FF4081 is 3.3:1 on white. It exists for hero bands and large numerals and must
  // never carry text. tests/e2e/tokens.spec.ts enforces this against the rendered DOM;
  // this test records WHY the rule exists so nobody "fixes" it later.
  it('fails AA on white, which is why it is banned as a text colour', () => {
    expect(ratio(token('pink-500'), token('surface'))).toBeLessThan(AA);
  });

  it('fails AA against white text on it, at body size', () => {
    expect(ratio('#FFFFFF', token('pink-500'))).toBeLessThan(AA);
  });
});

describe('measured font metrics', () => {
  it('the generated size-adjust is committed and in range', () => {
    const css = readFileSync('src/styles/font-metrics.generated.css', 'utf8');
    const m = css.match(/--mukta-size-adjust:\s*([\d.]+)%/);
    expect(m?.[1], 'run `npm run metrics`').toBeTruthy();
    const value = Number(m![1]);
    expect(value).toBeGreaterThanOrEqual(90);
    expect(value).toBeLessThanOrEqual(130);
  });

  it('records the conjunct acid test result', () => {
    const css = readFileSync('src/styles/font-metrics.generated.css', 'utf8');
    expect(css).toContain('स्त्रीधन');
    expect(css).toContain('ज़िंदगी');
  });
});
