export type Rarity = "common" | "rare" | "epic" | "legendary";
export type CardKind = "active" | "passive";

export type Effect =
  | { type: "damage"; mult: number; hits?: number }
  | { type: "heal"; pct: number }
  | { type: "fullHeal" }
  | { type: "shield"; pct: number; turns: number }
  | { type: "enemyAtkDown"; amount: number; turns: number }
  | { type: "enemyDefDown"; amount: number; turns: number }
  | { type: "poison"; dmg: number; turns: number }
  | { type: "enemySkip" }
  | { type: "dodge"; turns: number }
  | { type: "extraTurn" }
  | { type: "atk"; amount: number }
  | { type: "def"; amount: number }
  | { type: "maxHp"; amount: number }
  | { type: "startHeal"; amount: number }
  | { type: "reflect"; pct: number }
  | { type: "crit"; pct: number }
  | { type: "regen"; pct: number }
  | { type: "revive"; pct: number }
  | { type: "lastStand" };

export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  kind: CardKind;
  uses: number | null;
  poolSize: number;
  effects: Effect[];
  description: string;
  icon: string;
}

export const RARITY_META: Record<
  Rarity,
  { label: string; color: string; order: number }
> = {
  common: { label: "COMUNE", color: "#94a3b8", order: 0 },
  rare: { label: "RARA", color: "#38bdf8", order: 1 },
  epic: { label: "EPICA", color: "#c084fc", order: 2 },
  legendary: { label: "LEGGENDARIA", color: "#fbbf24", order: 3 },
};

export const CARDS: Card[] = [
  {
    id: "graffio-rapido",
    name: "GRAFFIO RAPIDO",
    rarity: "common",
    kind: "active",
    uses: 3,
    poolSize: 6,
    effects: [{ type: "damage", mult: 1.4 }],
    description: "Un graffio istintivo. Colpisce con forza 1.4x.",
    icon: "🐾",
  },
  {
    id: "bolla",
    name: "BOLLA",
    rarity: "common",
    kind: "active",
    uses: 2,
    poolSize: 6,
    effects: [
      { type: "damage", mult: 1 },
      { type: "enemyDefDown", amount: 1, turns: 2 },
    ],
    description: "Colpisce e intacca la difesa nemica.",
    icon: "🫧",
  },
  {
    id: "sbadiglio",
    name: "SBADIGLIO",
    rarity: "common",
    kind: "active",
    uses: 3,
    poolSize: 6,
    effects: [
      { type: "damage", mult: 0.5 },
      { type: "enemyAtkDown", amount: 1, turns: 2 },
    ],
    description: "Colpo debole ma riduce l'attacco nemico.",
    icon: "🥱",
  },
  {
    id: "grugnito",
    name: "RUGGITO",
    rarity: "common",
    kind: "active",
    uses: 2,
    poolSize: 6,
    effects: [{ type: "enemyAtkDown", amount: 2, turns: 2 }],
    description: "Intimidisce il nemico: -2 ATK per 2 turni.",
    icon: "😠",
  },
  {
    id: "guscio-duro",
    name: "GUSCIO DURO",
    rarity: "common",
    kind: "active",
    uses: 3,
    poolSize: 6,
    effects: [{ type: "shield", pct: 0.6, turns: 1 }],
    description: "Riduce del 60% il prossimo attacco subito.",
    icon: "🐚",
  },
  {
    id: "spuntino",
    name: "SPUNTINO",
    rarity: "common",
    kind: "active",
    uses: 3,
    poolSize: 6,
    effects: [{ type: "heal", pct: 0.25 }],
    description: "Recupera il 25% dei PV massimi.",
    icon: "🍎",
  },
  {
    id: "idropulsore",
    name: "IDROPULSORE",
    rarity: "rare",
    kind: "active",
    uses: 2,
    poolSize: 4,
    effects: [{ type: "damage", mult: 1.8 }],
    description: "Getto d'acqua concentrato. Forza 1.8x.",
    icon: "💦",
  },
  {
    id: "trivella",
    name: "TRIVELLA",
    rarity: "rare",
    kind: "active",
    uses: 2,
    poolSize: 4,
    effects: [{ type: "damage", mult: 0.6, hits: 3 }],
    description: "Tre colpi rapidi in sequenza.",
    icon: "🌀",
  },
  {
    id: "bevanda-energetica",
    name: "BEVANDA ENERGETICA",
    rarity: "rare",
    kind: "active",
    uses: 2,
    poolSize: 4,
    effects: [
      { type: "heal", pct: 0.3 },
      { type: "atk", amount: 2 },
    ],
    description: "Cura il 30% e aumenta l'ATK per la battaglia.",
    icon: "🥤",
  },
  {
    id: "veleno",
    name: "VELENO",
    rarity: "rare",
    kind: "active",
    uses: 2,
    poolSize: 4,
    effects: [{ type: "poison", dmg: 3, turns: 3 }],
    description: "Avvelena: 3 danni per 3 turni.",
    icon: "☠️",
  },
  {
    id: "coda-veloce",
    name: "CODA VELOCE",
    rarity: "rare",
    kind: "active",
    uses: 2,
    poolSize: 4,
    effects: [{ type: "extraTurn" }],
    description: "Agisci di nuovo subito dopo questa carta.",
    icon: "⚡",
  },
  {
    id: "bubba-del-sonno",
    name: "BUBBA DEL SONNO",
    rarity: "rare",
    kind: "active",
    uses: 1,
    poolSize: 4,
    effects: [{ type: "enemySkip" }],
    description: "Il nemico salta il prossimo turno.",
    icon: "💤",
  },
  {
    id: "miraggio",
    name: "MIRAGGIO",
    rarity: "rare",
    kind: "active",
    uses: 2,
    poolSize: 4,
    effects: [{ type: "dodge", turns: 1 }],
    description: "Schiva il prossimo attacco nemico.",
    icon: "🌫️",
  },
  {
    id: "polvere-curativa",
    name: "POLVERE CURATIVA",
    rarity: "rare",
    kind: "active",
    uses: 1,
    poolSize: 4,
    effects: [{ type: "heal", pct: 0.4 }],
    description: "Cura il 40% dei PV massimi.",
    icon: "🌿",
  },
  {
    id: "getto-d-acqua",
    name: "GETTO D'ACQUA",
    rarity: "epic",
    kind: "active",
    uses: 1,
    poolSize: 2,
    effects: [{ type: "damage", mult: 2.4 }],
    description: "Potente getto travolgente. Forza 2.4x.",
    icon: "🌊",
  },
  {
    id: "fulmine",
    name: "FULMINE",
    rarity: "epic",
    kind: "active",
    uses: 1,
    poolSize: 2,
    effects: [
      { type: "damage", mult: 1.2 },
      { type: "enemySkip" },
    ],
    description: "Colpisce e paralizza il nemico.",
    icon: "🌩️",
  },
  {
    id: "corsica-finale",
    name: "CORSICA FINALE",
    rarity: "legendary",
    kind: "active",
    uses: 1,
    poolSize: 1,
    effects: [{ type: "damage", mult: 4 }],
    description: "Il colpo definitivo. Forza 4x.",
    icon: "💥",
  },
  {
    id: "angelo-custode",
    name: "ANGELO CUSTODE",
    rarity: "legendary",
    kind: "active",
    uses: 1,
    poolSize: 1,
    effects: [{ type: "fullHeal" }],
    description: "Ripristina tutti i PV.",
    icon: "😇",
  },
  {
    id: "artigli-affilati",
    name: "ARTIGLI AFFILATI",
    rarity: "common",
    kind: "passive",
    uses: null,
    poolSize: 6,
    effects: [{ type: "atk", amount: 2 }],
    description: "+2 ATK permanente.",
    icon: "🦷",
  },
  {
    id: "guscio-rinforzato",
    name: "GUSCIO RINFORZATO",
    rarity: "common",
    kind: "passive",
    uses: null,
    poolSize: 6,
    effects: [{ type: "def", amount: 2 }],
    description: "+2 DEF permanente.",
    icon: "🛡️",
  },
  {
    id: "idratazione",
    name: "IDRATAZIONE",
    rarity: "common",
    kind: "passive",
    uses: null,
    poolSize: 6,
    effects: [{ type: "maxHp", amount: 8 }],
    description: "+8 PV massimi.",
    icon: "💧",
  },
  {
    id: "primo-soccorso",
    name: "PRIMO SOCCORSO",
    rarity: "common",
    kind: "passive",
    uses: null,
    poolSize: 6,
    effects: [{ type: "startHeal", amount: 10 }],
    description: "+10 PV all'inizio della battaglia.",
    icon: "🩹",
  },
  {
    id: "spine",
    name: "SPINE",
    rarity: "rare",
    kind: "passive",
    uses: null,
    poolSize: 4,
    effects: [{ type: "reflect", pct: 0.25 }],
    description: "Riflette il 25% del danno subito.",
    icon: "🌵",
  },
  {
    id: "amuleto-fortunato",
    name: "AMULETO FORTUNATO",
    rarity: "rare",
    kind: "passive",
    uses: null,
    poolSize: 4,
    effects: [{ type: "crit", pct: 0.2 }],
    description: "20% di probabilità di colpo critico.",
    icon: "🍀",
  },
  {
    id: "ferocia",
    name: "FEROCIA",
    rarity: "rare",
    kind: "passive",
    uses: null,
    poolSize: 4,
    effects: [
      { type: "atk", amount: 3 },
      { type: "def", amount: -1 },
    ],
    description: "+3 ATK ma -1 DEF.",
    icon: "🔥",
  },
  {
    id: "equilibrio",
    name: "EQUILIBRIO",
    rarity: "rare",
    kind: "passive",
    uses: null,
    poolSize: 4,
    effects: [
      { type: "atk", amount: 1 },
      { type: "def", amount: 1 },
    ],
    description: "+1 ATK e +1 DEF.",
    icon: "⚖️",
  },
  {
    id: "muro-di-sangue",
    name: "MURO DI SANGUE",
    rarity: "epic",
    kind: "passive",
    uses: null,
    poolSize: 2,
    effects: [{ type: "lastStand" }],
    description: "Sopravvivi a un colpo letale con 1 PV (una volta a battaglia).",
    icon: "❤️‍🔥",
  },
  {
    id: "cuore-puro",
    name: "CUORE PURO",
    rarity: "epic",
    kind: "passive",
    uses: null,
    poolSize: 2,
    effects: [{ type: "regen", pct: 0.08 }],
    description: "Recuperi l'8% dei PV a ogni tuo turno.",
    icon: "💗",
  },
  {
    id: "spirito-guardiano",
    name: "SPIRITO GUARDIANO",
    rarity: "legendary",
    kind: "passive",
    uses: 1,
    poolSize: 1,
    effects: [{ type: "revive", pct: 0.5 }],
    description: "Se sconfitto, risorgi con il 50% dei PV. Consumata all'uso.",
    icon: "👻",
  },
  {
    id: "aura-dell-eroe",
    name: "AURA DELL'EROE",
    rarity: "legendary",
    kind: "passive",
    uses: null,
    poolSize: 1,
    effects: [
      { type: "atk", amount: 3 },
      { type: "def", amount: 3 },
      { type: "maxHp", amount: 10 },
    ],
    description: "+3 ATK, +3 DEF, +10 PV.",
    icon: "🌟",
  },
];

export const CARD_BY_ID: Record<string, Card> = Object.fromEntries(
  CARDS.map((c) => [c.id, c]),
);
