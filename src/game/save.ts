import { CARDS } from "./cardsConfig";

export interface CardHolding {
  copies: number;
  usesLeft: number | null;
}

export interface SaveData {
  version: number;
  inventory: Record<string, CardHolding>;
  pool: Record<string, number>;
  equipped: (string | null)[];
  counters: {
    kmRight: number;
    kmLeft: number;
    feeds: number;
  };
  claimedSources: string[];
  claimedGates: boolean[];
}

const SAVE_KEY = "tama-save-v1";
const VERSION = 1;

export function freshSave(): SaveData {
  return {
    version: VERSION,
    inventory: {},
    pool: Object.fromEntries(CARDS.map((c) => [c.id, c.poolSize])),
    equipped: [null, null, null],
    counters: { kmRight: 0, kmLeft: 0, feeds: 0 },
    claimedSources: [],
    claimedGates: [false, false, false, false],
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return freshSave();
    const data = JSON.parse(raw) as SaveData;
    if (data.version !== VERSION) return freshSave();
    const base = freshSave();
    return {
      ...base,
      ...data,
      counters: { ...base.counters, ...data.counters },
      pool: { ...base.pool, ...data.pool },
      equipped: Array.isArray(data.equipped) ? data.equipped : base.equipped,
      claimedGates: Array.isArray(data.claimedGates)
        ? data.claimedGates
        : base.claimedGates,
    };
  } catch {
    return freshSave();
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // storage non disponibile: ignora
  }
}
