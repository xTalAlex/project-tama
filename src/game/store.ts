import { reactive } from "vue";
import { BOSSES, START_X, START_Y } from "./worldConfig";
import { CARDS, CARD_BY_ID } from "./cardsConfig";
import { loadSave, writeSave } from "./save";

export type SceneName = "" | "home" | "world" | "battle";

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  color: number;
}

export const gameStore = reactive({
  sceneRequest: "" as SceneName,
  input: {
    left: false,
    right: false,
    up: false,
    down: false,
  },
  progress: 0,
  gatesCleared: 0,
  worldX: START_X,
  worldY: START_Y,
  battle: {
    enemy: null as Enemy | null,
    result: "" as "win" | "lose" | "",
  },
  cards: loadSave(),
  cardMsg: "",
});

export function requestScene(name: SceneName) {
  gameStore.sceneRequest = name;
}

export function setDir(dir: "left" | "right" | "up" | "down", on: boolean) {
  gameStore.input[dir] = on;
}

export function beginBattle(gateIndex: number) {
  const boss = BOSSES[gateIndex];
  if (!boss) return;
  gameStore.battle.enemy = { ...boss };
  gameStore.battle.result = "";
}

export function saveGame() {
  writeSave(gameStore.cards);
}

let saveTimer: number | null = null;

function commit() {
  if (saveTimer !== null) return;
  saveTimer = window.setTimeout(() => {
    writeSave(gameStore.cards);
    saveTimer = null;
  }, 800);
}

export function claimFrom(source: string, cardId: string): boolean {
  const cards = gameStore.cards;
  const card = CARD_BY_ID[cardId];
  if (!card) return false;
  if (cards.claimedSources.includes(source)) return false;
  const remaining = cards.pool[cardId] ?? 0;
  if (remaining <= 0) return false;
  cards.pool[cardId] = remaining - 1;
  const hold = cards.inventory[cardId];
  if (hold) {
    hold.copies++;
    if (hold.usesLeft === null) {
      // permanente: nulla da fare
    } else if (hold.usesLeft === 0) {
      hold.usesLeft = card.uses ?? null;
    }
  } else {
    cards.inventory[cardId] = {
      copies: 1,
      usesLeft: card.uses === null ? null : card.uses,
    };
  }
  cards.claimedSources.push(source);
  gameStore.cardMsg = `OTTIENI: ${card.name}!`;
  commit();
  return true;
}

export function claimGateReward(gateIndex: number, cardId: string): boolean {
  const cards = gameStore.cards;
  if (cards.claimedGates[gateIndex]) return false;
  const card = CARD_BY_ID[cardId];
  if (!card) return false;
  const remaining = cards.pool[cardId] ?? 0;
  if (remaining <= 0) return false;
  cards.pool[cardId] = remaining - 1;
  const hold = cards.inventory[cardId];
  if (hold) {
    hold.copies++;
    if (hold.usesLeft !== null && hold.usesLeft === 0) {
      hold.usesLeft = card.uses ?? null;
    }
  } else {
    cards.inventory[cardId] = {
      copies: 1,
      usesLeft: card.uses === null ? null : card.uses,
    };
  }
  cards.claimedGates[gateIndex] = true;
  gameStore.cardMsg = `OTTIENI: ${card.name}!`;
  commit();
  return true;
}

export function useCard(cardId: string): boolean {
  const cards = gameStore.cards;
  const hold = cards.inventory[cardId];
  const card = CARD_BY_ID[cardId];
  if (!hold || hold.copies <= 0 || !card) return false;
  if (hold.usesLeft === null) return true;
  hold.usesLeft--;
  if (hold.usesLeft <= 0) {
    hold.copies--;
    if (hold.copies > 0) {
      hold.usesLeft = card.uses ?? null;
    } else {
      delete cards.inventory[cardId];
      cards.pool[cardId] = (cards.pool[cardId] ?? 0) + 1;
      cards.equipped = cards.equipped.map((e) => (e === cardId ? null : e));
      gameStore.cardMsg = `${card.name} ESAURITA: TORNATA NEL POOL`;
    }
  }
  commit();
  return true;
}

export function equipCard(cardId: string): boolean {
  const cards = gameStore.cards;
  const hold = cards.inventory[cardId];
  if (!hold || hold.copies <= 0) return false;
  if (cards.equipped.includes(cardId)) return false;
  const slot = cards.equipped.findIndex((e) => e === null);
  if (slot === -1) {
    cards.equipped[0] = cardId;
  } else {
    cards.equipped[slot] = cardId;
  }
  commit();
  return true;
}

export function unequipCard(slot: number) {
  gameStore.cards.equipped[slot] = null;
  commit();
}

export function addCounter(
  kind: "kmRight" | "kmLeft" | "feeds",
  amount: number,
) {
  gameStore.cards.counters[kind] += amount;
  commit();
}

export function equippedCards() {
  return gameStore.cards.equipped
    .filter((id): id is string => id !== null)
    .map((id) => CARD_BY_ID[id])
    .filter((c) => c !== undefined);
}

export function totalOwnedCards(): number {
  return Object.values(gameStore.cards.inventory).reduce(
    (sum, h) => sum + h.copies,
    0,
  );
}

export function remainingPool(): number {
  return Object.values(gameStore.cards.pool).reduce((sum, n) => sum + n, 0);
}

export const CARDS_CONFIG = CARDS;
