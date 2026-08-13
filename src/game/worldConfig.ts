export const WORLD_W = 2000;
export const WORLD_H = 552;
export const START_X = 184;
export const START_Y = 300;
export const SPEED = 220;
export const GATES = [400, 800, 1200, 1600];

export interface Boss {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  color: number;
}

export const BOSSES: Boss[] = [
  { name: "GUARDIAN I", hp: 40, maxHp: 40, atk: 6, def: 1, color: 0xf43f5e },
  { name: "GUARDIAN II", hp: 55, maxHp: 55, atk: 8, def: 2, color: 0xf97316 },
  { name: "GUARDIAN III", hp: 70, maxHp: 70, atk: 10, def: 3, color: 0xa855f7 },
  { name: "GUARDIAN IV", hp: 85, maxHp: 85, atk: 12, def: 4, color: 0x22c55e },
];

export const GOMAMON_HP = 50;
export const GOMAMON_ATK = 10;
export const GOMAMON_DEF = 2;
