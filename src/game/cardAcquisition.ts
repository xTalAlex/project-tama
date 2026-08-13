import { gameStore, claimFrom, claimGateReward } from "./store";

export interface WorldSpot {
  id: string;
  x: number;
  y: number;
  cardId: string;
  hint: string;
  hidden: boolean;
  revealAfter: number;
}

export const START_X_OFFSET = 184;

export const SPOTS: WorldSpot[] = [
  {
    id: "spot-pond",
    x: START_X_OFFSET + 950,
    y: 280,
    cardId: "getto-d-acqua",
    hint: "UNO STAGNO TRANQUILLO...",
    hidden: false,
    revealAfter: 0,
  },
  {
    id: "spot-mushroom",
    x: START_X_OFFSET + 1450,
    y: 380,
    cardId: "veleno",
    hint: "FUNGHI DALL'ASPETTO SOSPETTO",
    hidden: false,
    revealAfter: 0,
  },
  {
    id: "spot-hidden",
    x: START_X_OFFSET + 410,
    y: 520,
    cardId: "amuleto-fortunato",
    hint: "UN BAGLIORE APPENA PERCEPIBILE...",
    hidden: true,
    revealAfter: 300,
  },
];

export const KM_RIGHT_MILESTONES: { km: number; cardId: string; source: string }[] = [
  { km: 500, cardId: "spuntino", source: "km-right-500" },
  { km: 1000, cardId: "miraggio", source: "km-right-1000" },
];

export const KM_LEFT_MILESTONES: { km: number; cardId: string; source: string }[] = [
  { km: 150, cardId: "idratazione", source: "km-left-150" },
];

export const FEED_MILESTONES: { feeds: number; cardId: string; source: string }[] = [
  { feeds: 15, cardId: "primo-soccorso", source: "feeds-15" },
];

export const GATE_REWARDS: string[] = [
  "artigli-affilati",
  "guscio-rinforzato",
  "bolla",
  "corsica-finale",
];

export function tryClaimKmMilestone(dir: "right" | "left"): string | null {
  const milestones =
    dir === "right" ? KM_RIGHT_MILESTONES : KM_LEFT_MILESTONES;
  const km =
    dir === "right" ? gameStore.cards.counters.kmRight : gameStore.cards.counters.kmLeft;
  for (const m of milestones) {
    if (km >= m.km && !claimed(m.source)) {
      if (claimFrom(m.source, m.cardId)) return m.cardId;
    }
  }
  return null;
}

export function tryClaimFeedMilestone(): string | null {
  for (const m of FEED_MILESTONES) {
    if (gameStore.cards.counters.feeds >= m.feeds && !claimed(m.source)) {
      if (claimFrom(m.source, m.cardId)) return m.cardId;
    }
  }
  return null;
}

export function tryClaimGateReward(gateIndex: number): string | null {
  const cardId = GATE_REWARDS[gateIndex];
  if (!cardId) return null;
  if (gameStore.cards.claimedGates[gateIndex]) return null;
  if (claimGateReward(gateIndex, cardId)) return cardId;
  return null;
}

export function tryClaimSpot(spotId: string): string | null {
  const spot = SPOTS.find((s) => s.id === spotId);
  if (!spot) return null;
  if (claimed(spot.id)) return null;
  if (claimFrom(spot.id, spot.cardId)) return spot.cardId;
  return null;
}

export function isSpotClaimed(spotId: string): boolean {
  return claimed(spotId);
}

function claimed(source: string): boolean {
  return gameStore.cards.claimedSources.includes(source);
}
