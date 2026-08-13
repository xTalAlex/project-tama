import type { Effect } from "./cardsConfig";

export interface BattleState {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  shieldPct: number;
  shieldTurns: number;
  dodgeTurns: number;
  enemyAtkMod: number;
  enemyDefMod: number;
  enemyDefTurns: number;
  enemyAtkTurns: number;
  poisonDmg: number;
  poisonTurns: number;
  enemySkip: number;
  critChance: number;
  reflectPct: number;
  regenPct: number;
  revivePct: number | null;
  reviveUsed: boolean;
  lastStandUsed: boolean;
}

export function newBattleState(maxHp: number, atk: number, def: number): BattleState {
  return {
    hp: maxHp,
    maxHp,
    atk,
    def,
    shieldPct: 0,
    shieldTurns: 0,
    dodgeTurns: 0,
    enemyAtkMod: 0,
    enemyDefMod: 0,
    enemyDefTurns: 0,
    enemyAtkTurns: 0,
    poisonDmg: 0,
    poisonTurns: 0,
    enemySkip: 0,
    critChance: 0,
    reflectPct: 0,
    regenPct: 0,
    revivePct: null,
    reviveUsed: false,
    lastStandUsed: true,
  };
}

export function applyPassive(state: BattleState, effect: Effect) {
  switch (effect.type) {
    case "atk":
      state.atk += effect.amount;
      break;
    case "def":
      state.def += effect.amount;
      break;
    case "maxHp":
      state.maxHp += effect.amount;
      state.hp += effect.amount;
      break;
    case "startHeal":
      state.hp = Math.min(state.maxHp, state.hp + effect.amount);
      break;
    case "reflect":
      state.reflectPct += effect.pct;
      break;
    case "crit":
      state.critChance += effect.pct;
      break;
    case "regen":
      state.regenPct += effect.pct;
      break;
    case "revive":
      state.revivePct = effect.pct;
      break;
    case "lastStand":
      state.lastStandUsed = false;
      break;
  }
}

export function rollAttackDamage(
  state: BattleState,
  rng: () => number,
  enemyDef: number,
  mult = 1,
): { dmg: number; crit: boolean } {
  const def = Math.max(0, enemyDef + state.enemyDefMod);
  const base = Math.max(1, state.atk - def);
  const dmg = Math.max(1, Math.floor((base + rng() * 5) * mult));
  const crit = rng() < state.critChance;
  return { dmg: crit ? dmg * 2 : dmg, crit };
}

export interface ActiveCtx {
  rng: () => number;
  log: (s: string) => void;
  enemyDef: number;
  dealToEnemy: (dmg: number, label: string) => void;
}

export function resolveActive(
  state: BattleState,
  effect: Effect,
  ctx: ActiveCtx,
): "enemyTurn" | "extraTurn" {
  const { rng, log, enemyDef, dealToEnemy } = ctx;
  switch (effect.type) {
    case "damage": {
      const hits = effect.hits ?? 1;
      let total = 0;
      for (let i = 0; i < hits; i++) {
        const { dmg, crit } = rollAttackDamage(state, rng, enemyDef, effect.mult);
        total += dmg;
        if (crit) log("COLPO CRITICO!");
      }
      dealToEnemy(total, "CARTE: DANNO!");
      return "enemyTurn";
    }
    case "heal": {
      const amt = Math.round(state.maxHp * effect.pct);
      state.hp = Math.min(state.maxHp, state.hp + amt);
      log(`+${amt} PV`);
      return "enemyTurn";
    }
    case "atk": {
      state.atk += effect.amount;
      log(`ATK +${effect.amount}`);
      return "enemyTurn";
    }
    case "fullHeal": {
      const amt = state.maxHp - state.hp;
      state.hp = state.maxHp;
      log(`+${amt} PV (TOTALE)`);
      return "enemyTurn";
    }
    case "shield": {
      state.shieldPct = effect.pct;
      state.shieldTurns = effect.turns;
      log(`GUSCIO: -${Math.round(effect.pct * 100)}% danno`);
      return "enemyTurn";
    }
    case "enemyAtkDown": {
      state.enemyAtkMod -= effect.amount;
      state.enemyAtkTurns = Math.max(state.enemyAtkTurns, effect.turns);
      log(`NEMICO -${effect.amount} ATK (${effect.turns} turni)`);
      return "enemyTurn";
    }
    case "enemyDefDown": {
      state.enemyDefMod -= effect.amount;
      state.enemyDefTurns = Math.max(state.enemyDefTurns, effect.turns);
      log(`NEMICO -${effect.amount} DEF (${effect.turns} turni)`);
      return "enemyTurn";
    }
    case "poison": {
      state.poisonDmg += effect.dmg;
      state.poisonTurns = Math.max(state.poisonTurns, effect.turns);
      log(`AVVELENATO: ${effect.dmg}/turno x${effect.turns}`);
      return "enemyTurn";
    }
    case "enemySkip": {
      state.enemySkip++;
      log("NEMICO SALTA IL TURNO!");
      return "enemyTurn";
    }
    case "dodge": {
      state.dodgeTurns = Math.max(state.dodgeTurns, effect.turns);
      log("PRONTO A SCHIVARE");
      return "enemyTurn";
    }
    case "extraTurn":
      return "extraTurn";
    default:
      return "enemyTurn";
  }
}

export function startPlayerTurn(state: BattleState): { regen: number; poison: number } {
  const regen = state.regenPct > 0 ? Math.round(state.maxHp * state.regenPct) : 0;
  if (regen > 0) state.hp = Math.min(state.maxHp, state.hp + regen);
  const poison = state.poisonTurns > 0 ? state.poisonDmg : 0;
  if (state.poisonTurns > 0) state.poisonTurns--;
  return { regen, poison };
}

export function applyPlayerDamage(state: BattleState, rawDmg: number) {
  let taken = rawDmg;
  let reflected = 0;
  if (state.dodgeTurns > 0) {
    state.dodgeTurns--;
    return { taken: 0, reflected: 0, dodged: true };
  }
  if (state.shieldTurns > 0) {
    taken = Math.max(0, Math.round(taken * (1 - state.shieldPct)));
    state.shieldTurns--;
  }
  if (state.reflectPct > 0) reflected = Math.max(0, Math.round(taken * state.reflectPct));
  state.hp -= taken;
  return { taken, reflected, dodged: false };
}

export function tickModifiers(state: BattleState) {
  if (state.enemyAtkTurns > 0) state.enemyAtkTurns--;
  if (state.enemyAtkTurns === 0) state.enemyAtkMod = 0;
  if (state.enemyDefTurns > 0) state.enemyDefTurns--;
  if (state.enemyDefTurns === 0) state.enemyDefMod = 0;
}
