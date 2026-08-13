<template>
  <Rectangle
    :x="0"
    :y="0"
    :width="368"
    :height="368"
    :fill-color="0x1a0f14"
    :origin="0"
  />
  <Line
    :x1="0"
    :y1="312"
    :x2="368"
    :y2="312"
    :stroke-color="0x334155"
    :line-width="2"
  />

  <Text
    :x="184"
    :y="22"
    :text="enemy.name"
    :origin="0.5"
    :style="{ fontSize: '14px', color: '#fda4af', fontFamily: 'monospace', letterSpacing: '2px' }"
  />
  <Rectangle
    :x="64"
    :y="38"
    :width="240"
    :height="10"
    :fill-color="0x0b1220"
    :origin="0"
  />
  <Rectangle
    :x="64"
    :y="38"
    :width="enemyHpWidth"
    :height="10"
    :fill-color="enemy.color"
    :origin="0"
  />

  <Container ref="enemyContainer" :x="184" :y="132">
    <Circle
      :radius="34"
      :fill-color="enemy.color"
      :fill-alpha="0.92"
      :stroke-color="0x0b1220"
      :stroke-alpha="1"
      :line-width="3"
    />
    <Triangle
      :x1="-22"
      :y1="-34"
      :x2="-6"
      :y2="-66"
      :x3="8"
      :y3="-34"
      :fill-color="enemy.color"
      :fill-alpha="0.92"
      :stroke-color="0x0b1220"
      :stroke-alpha="1"
      :line-width="2"
    />
    <Triangle
      :x1="-8"
      :y1="-34"
      :x2="6"
      :y2="-66"
      :x3="22"
      :y3="-34"
      :fill-color="enemy.color"
      :fill-alpha="0.92"
      :stroke-color="0x0b1220"
      :stroke-alpha="1"
      :line-width="2"
    />
    <Circle :x="-12" :y="-4" :radius="8" :fill-color="0xffffff" />
    <Circle :x="12" :y="-4" :radius="8" :fill-color="0xffffff" />
    <Circle :x="-12" :y="-4" :radius="3.5" :fill-color="0x0b1220" />
    <Circle :x="12" :y="-4" :radius="3.5" :fill-color="0x0b1220" />
    <Triangle
      :x1="-9"
      :y1="14"
      :x2="9"
      :y2="14"
      :x3="0"
      :y3="27"
      :fill-color="0x0b1220"
      :fill-alpha="0.85"
    />
  </Container>

  <Rectangle
    :x="14"
    :y="172"
    :width="236"
    :height="92"
    :fill-color="0x0b1220"
    :fill-alpha="0.55"
    :radius="6"
    :origin="0"
  />
  <Text
    :x="22"
    :y="182"
    :text="logText"
    :origin="0"
    :style="{ fontSize: '13px', color: '#e2e8f0', fontFamily: 'monospace', lineSpacing: 6 }"
  />

  <Text
    :x="24"
    :y="272"
    :text="'GOMAMON'"
    :origin="0"
    :style="{ fontSize: '12px', color: '#7dd3fc', fontFamily: 'monospace' }"
  />
  <Rectangle
    :x="24"
    :y="286"
    :width="110"
    :height="10"
    :fill-color="0x0b1220"
    :origin="0"
  />
  <Rectangle
    :x="24"
    :y="286"
    :width="gomamonHpWidth"
    :height="10"
    :fill-color="0x22d3ee"
    :origin="0"
  />
  <Sprite
    v-if="preloaded"
    ref="gomamonSprite"
    texture="gomamon-back"
    frame="5"
    :x="84"
    :y="322"
    :scale="2"
  />

  <template v-for="(card, i) in activeCards" :key="card.id">
    <Circle
      :x="210 + i * 58"
      :y="296"
      :radius="14"
      :fill-color="0x0e7490"
      :fill-alpha="cardAlpha(card)"
      :stroke-color="0x67e8f9"
      :stroke-alpha="0.5"
      :line-width="1.5"
      @pointerdown="doCard(card)"
    />
    <Text
      :x="210 + i * 58"
      :y="291"
      :text="card.icon"
      :origin="0.5"
      :alpha="cardAlpha(card)"
      :style="{ fontSize: '13px' }"
    />
    <Text
      :x="210 + i * 58"
      :y="307"
      :text="usesLabel(card)"
      :origin="0.5"
      :alpha="cardAlpha(card)"
      :style="{ fontSize: '8px', color: '#e2e8f0', fontFamily: 'monospace' }"
    />
  </template>

  <Circle
    :x="232"
    :y="340"
    :radius="24"
    :fill-color="0x0e7490"
    :fill-alpha="buttonAlpha"
    :stroke-color="0x67e8f9"
    :stroke-alpha="0.4"
    :line-width="2"
    @pointerdown="doAttack"
  />
  <Triangle
    :x1="220"
    :y1="329"
    :x2="243"
    :y2="340"
    :x3="220"
    :y3="351"
    :fill-color="0xffffff"
    :fill-alpha="buttonAlpha"
  />
  <Circle
    :x="314"
    :y="340"
    :radius="24"
    :fill-color="0x57534e"
    :fill-alpha="buttonAlpha"
    :stroke-color="0xa8a29e"
    :stroke-alpha="0.4"
    :line-width="2"
    @pointerdown="doDefend"
  />
  <Rectangle
    :x="314"
    :y="340"
    :width="14"
    :height="18"
    :radius="3"
    :fill-color="0xffffff"
    :fill-alpha="buttonAlpha"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import type * as Phaser from "phaser";
import {
  Circle,
  Container,
  Line,
  Rectangle,
  refPhaserInstance,
  Sprite,
  Text,
  useScene,
} from "phavuer";
import type { Card } from "../cardsConfig";
import {
  applyPassive,
  applyPlayerDamage,
  newBattleState,
  resolveActive,
  rollAttackDamage,
  startPlayerTurn,
  tickModifiers,
} from "../cardEffects";
import {
  equippedCards,
  gameStore,
  requestScene,
  useCard,
} from "../store";
import { tryClaimGateReward } from "../cardAcquisition";
import {
  GOMAMON_ATK,
  GOMAMON_DEF,
  GOMAMON_HP,
  START_X,
  START_Y,
} from "../worldConfig";

defineProps<{ preloaded: boolean }>();

const scene = useScene();
const camera = scene.cameras.main;

const enemy =
  gameStore.battle.enemy ?? {
    name: "???",
    hp: 1,
    maxHp: 1,
    atk: 1,
    def: 0,
    color: 0xffffff,
  };

const gomamonSprite = refPhaserInstance<Phaser.GameObjects.Sprite>(null);
const enemyContainer = refPhaserInstance<Phaser.GameObjects.Container>(null);

const GOMAMON_BASE_X = 96;
const GOMAMON_BASE_Y = 310;
const GOMAMON_SCALE = 2;
const ATTACK_TARGET_X = 184;
const ATTACK_TARGET_Y = 184;
const ATTACK_SCALE = 3.2;
let enemyHitApplied = false;

const battle = reactive(newBattleState(GOMAMON_HP, GOMAMON_ATK, GOMAMON_DEF));
const enemyHp = ref(enemy.hp);
const phase = ref<"player" | "enemy" | "win" | "lose">("player");
const busy = ref(false);
const logLines = ref<string[]>([`BATTAGLIA VS ${enemy.name}`]);

let timers: number[] = [];

const enemyHpWidth = computed(() =>
  Math.max(0, (enemyHp.value / enemy.maxHp) * 240),
);
const gomamonHpWidth = computed(() =>
  Math.max(0, (battle.hp / battle.maxHp) * 120),
);
const logText = computed(() => logLines.value.slice(-3).join("\n"));
const buttonAlpha = computed(() => (phase.value === "player" ? 1 : 0.35));

const activeCards = computed(() =>
  equippedCards().filter(
    (c) =>
      c.kind === "active" &&
      (gameStore.cards.inventory[c.id]?.copies ?? 0) > 0,
  ),
);
const cardAlpha = (card: Card) =>
  phase.value === "player" && !busy.value ? 1 : 0.35;
const usesLabel = (card: Card) => {
  if (card.uses === null) return "∞";
  return `${gameStore.cards.inventory[card.id]?.usesLeft ?? 0}`;
};

function addLog(line: string) {
  logLines.value = [...logLines.value, line].slice(-4);
}

function rollEnemyDamage(atk: number, def: number) {
  return Math.max(1, atk - def + Math.floor(Math.random() * 5));
}

function playAttackAnim() {
  const s = gomamonSprite.value;
  if (!s) return;
  s.play("gomamon-attack");
  s.off("animationupdate");
  s.on("animationupdate", (_anim, frame) => {
    if (Number(frame.textureFrame) === 1) applyPlayerHit();
  });
}

function applyPlayerHit() {
  if (enemyHitApplied) return;
  enemyHitApplied = true;
  const { dmg, crit } = rollAttackDamage(battle, Math.random, enemy.def);
  if (crit) addLog("COLPO CRITICO!");
  dealToEnemy(dmg, "GOMAMON GRAFFIA!");
}

function dealToEnemy(dmg: number, label: string) {
  enemyHp.value = Math.max(0, enemyHp.value - dmg);
  addLog(`${label} -${dmg} HP`);
  const c = enemyContainer.value;
  if (c) {
    scene.tweens.add({
      targets: c,
      x: c.x + 6,
      duration: 80,
      ease: "Quad.easeOut",
      yoyo: true,
      repeat: 2,
    });
    scene.tweens.add({
      targets: c,
      alpha: 0.2,
      duration: 50,
      yoyo: true,
      repeat: 2,
    });
  }
  camera.shake(130, 0.006);
  showDamage(dmg);
  if (enemyHp.value <= 0) endBattle("win");
}

function doCard(card: Card) {
  if (busy.value || phase.value !== "player") return;
  busy.value = true;
  if (!useCard(card.id)) {
    busy.value = false;
    return;
  }
  addLog(`USI: ${card.name}`);
  let extra = false;
  for (const effect of card.effects) {
    const outcome = resolveActive(battle, effect, {
      rng: Math.random,
      log: addLog,
      enemyDef: enemy.def,
      dealToEnemy,
    });
    if (outcome === "extraTurn") extra = true;
    if (enemyHp.value <= 0) return;
  }
  if (extra) {
    busy.value = false;
    return;
  }
  phase.value = "enemy";
  scheduleEnemyTurn();
}

function showDamage(dmg: number) {
  const c = enemyContainer.value;
  if (!c) return;
  const t = scene.add.text(c.x, c.y - 60, `-${dmg}`, {
    fontSize: "20px",
    color: "#f87171",
    fontFamily: "monospace",
    stroke: "#0b1220",
    strokeThickness: 4,
  });
  t.setOrigin(0.5);
  t.setDepth(2000);
  scene.tweens.add({
    targets: t,
    y: t.y - 38,
    alpha: 0,
    duration: 700,
    ease: "Quad.easeOut",
    onComplete: () => t.destroy(),
  });
}

function playScenicAttack(onDone: () => void) {
  const s = gomamonSprite.value;
  if (!s) return;
  s.setTexture("gomamon-back", 5);
  s.setFlipX(false);
  scene.tweens.add({
    targets: s,
    x: GOMAMON_BASE_X - 12,
    scale: GOMAMON_SCALE * 1.1,
    duration: 150,
    ease: "Sine.easeOut",
    onComplete: () => {
      s.setFlipX(true);
      playAttackAnim();
      scene.tweens.add({
        targets: s,
        x: ATTACK_TARGET_X,
        y: ATTACK_TARGET_Y,
        scale: ATTACK_SCALE,
        duration: 520,
        ease: "Sine.easeIn",
        onComplete: () => {
          s.setTexture("gomamon-back", 5);
          s.setFlipX(false);
          scene.tweens.add({
            targets: s,
            x: GOMAMON_BASE_X,
            y: GOMAMON_BASE_Y,
            scale: GOMAMON_SCALE,
            duration: 260,
            ease: "Sine.easeInOut",
            onComplete: onDone,
          });
        },
      });
    },
  });
}

function doAttack() {
  if (busy.value || phase.value !== "player") return;
  busy.value = true;
  phase.value = "enemy";
  enemyHitApplied = false;
  playScenicAttack(() => {
    if (phase.value !== "win") scheduleEnemyTurn();
  });
}

function doDefend() {
  if (busy.value || phase.value !== "player") return;
  busy.value = true;
  battle.shieldPct = 0.5;
  battle.shieldTurns = 1;
  addLog("GOMAMON SI DIFENDE (-50% danno)");
  const s = gomamonSprite.value;
  if (s) {
    scene.tweens.add({
      targets: s,
      scaleX: GOMAMON_SCALE * 1.2,
      scaleY: GOMAMON_SCALE * 0.8,
      duration: 130,
      ease: "Sine.easeOut",
      yoyo: true,
    });
  }
  phase.value = "enemy";
  scheduleEnemyTurn();
}

function scheduleEnemyTurn() {
  timers.push(
    window.setTimeout(() => {
      if (battle.enemySkip > 0) {
        battle.enemySkip--;
        addLog(`${enemy.name} SALTA IL TURNO!`);
        applyTurnStart();
        phase.value = "player";
        busy.value = false;
        return;
      }
      const atk = Math.max(0, enemy.atk + battle.enemyAtkMod);
      const { taken, reflected } = applyPlayerDamage(
        battle,
        rollEnemyDamage(atk, battle.def),
      );
      if (taken > 0) {
        addLog(`${enemy.name} COLPISCE! -${taken} HP`);
        camera.shake(120, 0.006);
      } else if (!reflected) {
        addLog(`${enemy.name} NON TI COLPISCE!`);
      }
      if (reflected > 0) {
        dealToEnemy(reflected, "RIFLESSO!");
        if (enemyHp.value <= 0) return;
      }
      tickModifiers(battle);
      if (battle.hp <= 0) {
        if (!battle.lastStandUsed) {
          battle.lastStandUsed = true;
          battle.hp = 1;
          addLog("MURO DI SANGUE: SOPRAVVIVI CON 1 PV!");
        } else if (battle.revivePct !== null && !battle.reviveUsed) {
          battle.reviveUsed = true;
          battle.hp = Math.round(battle.maxHp * battle.revivePct);
          useCard("spirito-guardiano");
          addLog("SPIRITO GUARDIANO: RISORGI!");
        } else {
          endBattle("lose");
          return;
        }
      }
      applyTurnStart();
      if (enemyHp.value <= 0) return;
      phase.value = "player";
      busy.value = false;
    }, 950),
  );
}

function applyTurnStart() {
  const { regen, poison } = startPlayerTurn(battle);
  if (regen > 0) addLog(`+${regen} PV (CUORE PURO)`);
  if (poison > 0) {
    dealToEnemy(poison, "VELENO!");
  }
}

function endBattle(result: "win" | "lose") {
  phase.value = result;
  busy.value = true;
  if (result === "win") {
    addLog(`${enemy.name} SCONFITTO!`);
    gameStore.battle.result = "win";
    gameStore.gatesCleared++;
    tryClaimGateReward(gameStore.gatesCleared - 1);
  } else {
    addLog("GOMAMON E' ESAUSTO...");
    gameStore.battle.result = "lose";
    gameStore.worldX = START_X;
    gameStore.worldY = START_Y;
  }
  timers.push(window.setTimeout(() => requestScene("world"), 2400));
}

onMounted(() => {
  const c = enemyContainer.value;
  if (c) {
    scene.tweens.add({
      targets: c,
      y: c.y - 6,
      duration: 700,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });
  }
  for (const card of equippedCards()) {
    if (card.kind !== "passive") continue;
    for (const effect of card.effects) applyPassive(battle, effect);
    addLog(`${card.name} ATTIVA`);
  }
});

onBeforeUnmount(() => {
  timers.forEach((t) => window.clearTimeout(t));
  timers = [];
  gameStore.input.left =
    gameStore.input.right =
    gameStore.input.up =
    gameStore.input.down =
      false;
});
</script>

<script lang="ts">
import type * as Phaser from "phaser";

export function preloadBattle(scene: Phaser.Scene) {
  scene.load.spritesheet("gomamon-attack", "/sprites/gomamon/attack.png", {
    frameWidth: 64,
    frameHeight: 64,
  });
  scene.load.spritesheet("gomamon-back", "/sprites/gomamon/walkR.png", {
    frameWidth: 28,
    frameHeight: 28,
  });
}

export function createBattle(scene: Phaser.Scene) {
  if (!scene.anims.exists("gomamon-attack")) {
    scene.anims.create({
      key: "gomamon-attack",
      frames: [
        { key: "gomamon-attack", frame: 0 },
        { key: "gomamon-attack", frame: 1 },
        { key: "gomamon-attack", frame: 1 },
        { key: "gomamon-attack", frame: 0 },
      ],
      frameRate: 8,
      repeat: 0,
    });
  }
}
</script>
