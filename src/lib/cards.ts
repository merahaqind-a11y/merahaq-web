import type { CardId, Lang } from './types';

export const CARD_ORDER: readonly CardId[] = [
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
  'C6',
  'C7',
  'C8',
  'C9',
  'C10',
];

export type IconName =
  | 'jewellery'
  | 'purse'
  | 'house'
  | 'rupee'
  | 'land'
  | 'bank'
  | 'papers'
  | 'scales'
  | 'lamp'
  | 'debt';

export interface CardMeta {
  id: CardId;
  slug: string;
  icon: IconName;
  title: Record<Lang, string>;
  /** One line, on the card face and in the gallery. Kept short, it is read at a glance. */
  summary: Record<Lang, string>;
  /** F-33, every card within two taps of anywhere. */
  crossLinks: CardId[];
  /** Deck role, from the Diagnostic Spec §1. */
  role: 'scored' | 'universal' | 'pinned';
}

/**
 * The card registry, titles, summaries and wiring. Full card bodies (kanoon,
 * asli zindagi, sambhaal, ek kadam, authority) live in src/content/cards/ so they
 * can be versioned and legally reviewed independently of the code.
 *
 * Titles and summaries come from the two card masters. English is authored plain
 * English for the supporter, not transliteration (PRD §5.11 r5).
 */
export const CARDS: Record<CardId, CardMeta> = {
  C1: {
    id: 'C1',
    slug: 'c1',
    icon: 'jewellery',
    role: 'scored',
    crossLinks: ['C7', 'C8'],
    title: {
      hi: 'स्त्रीधन, आपके गहने आपके हैं',
      hinglish: 'Streedhan, aapke gehne aapke hain',
      en: 'Your jewellery is yours',
    },
    summary: {
      hi: 'शादी में मिले गहने और तोहफ़े हमेशा आपके हैं।',
      hinglish: 'Shaadi mein mile gehne aur tohfe hamesha aapke hain.',
      en: 'Gifts and jewellery given at your wedding stay yours, permanently.',
    },
  },
  C2: {
    id: 'C2',
    slug: 'c2',
    icon: 'purse',
    role: 'scored',
    crossLinks: ['C3', 'C6', 'C8'],
    title: {
      hi: 'पैसे रोकना भी हिंसा है',
      hinglish: 'Paise rokna bhi hinsa hai',
      en: 'Withholding money is violence too',
    },
    summary: {
      hi: 'कमाई छीनना या खर्चा रोकना कानून में हिंसा है।',
      hinglish: 'Kamai chheenna ya kharcha rokna kanoon mein hinsa hai.',
      en: 'Taking your earnings or withholding household money is domestic violence in law.',
    },
  },
  C3: {
    id: 'C3',
    slug: 'c3',
    icon: 'house',
    role: 'scored',
    crossLinks: ['C2', 'C4', 'C8'],
    title: {
      hi: 'घर में रहने का हक़',
      hinglish: 'Ghar mein rehne ka haq',
      en: 'The right to stay in your home',
    },
    summary: {
      hi: 'घर आपके नाम पर न हो, तब भी रहने का हक़ है।',
      hinglish: 'Ghar aapke naam par na ho, tab bhi rehne ka haq hai.',
      en: 'You cannot simply be put out, whether or not the house is in your name.',
    },
  },
  C4: {
    id: 'C4',
    slug: 'c4',
    icon: 'rupee',
    role: 'scored',
    crossLinks: ['C3', 'C8'],
    title: {
      hi: 'गुज़ारे का पैसा',
      hinglish: 'Guzare ka paisa',
      en: 'Monthly maintenance',
    },
    summary: {
      hi: 'हर महीने गुज़ारे का पैसा माँगना आपका कानूनी हक़ है।',
      hinglish: 'Har mahine guzare ka paisa maangna aapka kanooni haq hai.',
      en: 'Monthly support is a legal entitlement, and filing through DLSA is free.',
    },
  },
  C5: {
    id: 'C5',
    slug: 'c5',
    icon: 'land',
    role: 'scored',
    crossLinks: ['C7', 'C8'],
    title: {
      hi: 'बेटी का बराबर हिस्सा',
      hinglish: 'Beti ka barabar hissa',
      en: "A daughter's equal share",
    },
    summary: {
      hi: 'बेटी जन्म से ही बेटे के बराबर हिस्सेदार है।',
      hinglish: 'Beti janm se hi bete ke barabar hissedar hai.',
      en: 'A daughter is an equal coparcener from birth, married or not.',
    },
  },
  C6: {
    id: 'C6',
    slug: 'c6',
    icon: 'bank',
    role: 'scored',
    crossLinks: ['C7', 'C2'],
    title: {
      hi: 'अपना बैंक खाता',
      hinglish: 'Apna bank khaata',
      en: 'Your own bank account',
    },
    summary: {
      hi: 'खाता खोलने के लिए किसी की इजाज़त नहीं चाहिए।',
      hinglish: 'Khaata kholne ke liye kisi ki ijaazat nahin chahiye.',
      en: 'No husband or father needs to permit or sign for your account.',
    },
  },
  C7: {
    id: 'C7',
    slug: 'c7',
    icon: 'papers',
    role: 'scored',
    crossLinks: ['C1', 'C6'],
    title: {
      hi: 'काग़ज़ जो आपकी ताक़त हैं',
      hinglish: 'Kaagaz jo aapki taakat hain',
      en: 'The papers that are your power',
    },
    summary: {
      hi: 'हर हक़ तभी चलता है जब काग़ज़ आपके हाथ में हों।',
      hinglish: 'Har haq tabhi chalta hai jab kaagaz aapke haath mein hon.',
      en: 'Every other right only works when the proof is within your reach.',
    },
  },
  C8: {
    id: 'C8',
    slug: 'c8',
    icon: 'scales',
    role: 'universal',
    crossLinks: ['C4', 'C5'],
    title: {
      hi: 'मुफ़्त वकील आपका हक़ है',
      hinglish: 'Muft vakil aapka haq hai',
      en: 'A free lawyer is your right',
    },
    summary: {
      hi: 'हर औरत मुफ़्त कानूनी मदद की हक़दार है, कोई आमदनी की शर्त नहीं।',
      hinglish: 'Har aurat muft kanooni madad ki haqdaar hai, koi aamdani ki shart nahin.',
      en: 'Every woman qualifies for free legal aid, with no income limit at all.',
    },
  },
  C9: {
    id: 'C9',
    slug: 'c9',
    icon: 'lamp',
    role: 'pinned',
    crossLinks: ['C5', 'C8'],
    title: {
      hi: 'विधवा का हिस्सा',
      hinglish: 'Vidhwa ka hissa',
      en: "A widow's share",
    },
    summary: {
      hi: 'पति की चीज़ों में आपका हिस्सा बच्चों के बराबर है।',
      hinglish: 'Pati ki cheezon mein aapka hissa bachchon ke barabar hai.',
      en: 'You are a Class I heir, sharing equally with the children.',
    },
  },
  C10: {
    id: 'C10',
    slug: 'c10',
    icon: 'debt',
    role: 'scored',
    crossLinks: ['C6', 'C8'],
    title: {
      hi: 'कर्ज़ आपका नहीं है',
      hinglish: 'Karz aapka nahin hai',
      en: 'The debt is not yours',
    },
    summary: {
      hi: 'पति के लोन की ज़िम्मेदारी अपने-आप आप पर नहीं आती।',
      hinglish: 'Pati ke loan ki zimmedari apne-aap aap par nahin aati.',
      en: "A husband's personal loan does not become your liability by default.",
    },
  },
};

export const CARD_LIST: readonly CardMeta[] = CARD_ORDER.map((id) => CARDS[id]);

export function cardBySlug(slug: string): CardMeta | undefined {
  return CARD_LIST.find((c) => c.slug === slug);
}

/** The date the card content was verified against official portals (F-35). */
export const VERIFIED_ON = '2026-08-13';

export const VERIFIED_ON_DISPLAY: Record<Lang, string> = {
  hi: '13 अगस्त 2026',
  hinglish: '13 August 2026',
  en: '13 August 2026',
};
