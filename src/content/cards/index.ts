import { BODIES_1_5 } from './bodies-1-5';
import { BODIES_6_10 } from './bodies-6-10';
import type { CardBody } from './types';
import type { CardId } from '../../lib/types';

export const BODIES = { ...BODIES_1_5, ...BODIES_6_10 } as Record<CardId, CardBody>;

export function body(id: CardId): CardBody {
  const b = BODIES[id];
  if (!b) throw new Error(`card body missing for ${id}`);
  return b;
}

export type { CardBody, CardTrack } from './types';
