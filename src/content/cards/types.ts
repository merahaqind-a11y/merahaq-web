import type { CardId, Lang } from '../../lib/types';

export interface CardTrack {
  /** क़ानून क्या कहता है — what the law actually says, with section numbers. */
  kanoon: string[];
  /** असली ज़िंदगी में — things everyone calls normal that the law does not allow.
   *  Every line ends in its verdict, because the verdict is the point. */
  asli: string[];
  /** सँभाल कर रखें — what she can do quietly and safely. */
  sambhaal: string[];
  /** एक कदम आज — exactly ONE action. F-28. */
  ekKadam: string;
  authority: {
    office: string;
    askFor: string;
  };
}

export interface CardBody {
  hi: CardTrack;
  hinglish: CardTrack;
  en: CardTrack;
  /** Language-independent: numbers and portals are the same in every track. */
  numbers: string[];
  portals: { label: string; href: string }[];
}

export type CardBodies = Partial<Record<CardId, CardBody>>;

export type { CardId, Lang };
