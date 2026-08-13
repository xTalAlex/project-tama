<template>
  <Rectangle
    :x="0"
    :y="0"
    :width="WORLD_W"
    :height="WORLD_H"
    :fill-color="0x0b1220"
    :origin="0"
  />
  <Line
    v-for="i in 34"
    :key="'gv' + i"
    :x1="46 * i"
    :y1="0"
    :x2="46 * i"
    :y2="WORLD_H"
    :stroke-color="0x182742"
    :line-width="1"
  />
  <Line
    v-for="i in 12"
    :key="'gh' + i"
    :x1="0"
    :y1="46 * i"
    :x2="WORLD_W"
    :y2="46 * i"
    :stroke-color="0x182742"
    :line-width="1"
  />

  <Rectangle
    v-for="(g, i) in GATES"
    :key="'gate' + i"
    :x="START_X + g"
    :y="0"
    :width="4"
    :height="WORLD_H"
    :fill-color="0xf43f5e"
    :alpha="0.5"
    :origin="0"
  />

  <Sprite
    v-if="preloaded"
    ref="player"
    texture="gomamon-walk"
    :x="START_X"
    :y="START_Y"
    :scale="2.2"
    :flip-x="flipX"
  />

  <Text
    :x="10"
    :y="10"
    :text="hudText"
    :origin="0"
    :scroll-factor="0"
    :style="{ fontSize: '14px', color: '#22d3ee', fontFamily: 'monospace' }"
  />
  <Text
    v-if="gateMsg"
    :x="184"
    :y="70"
    :text="gateMsg"
    :origin="0.5"
    :scroll-factor="0"
    :style="{ fontSize: '18px', color: '#f43f5e', fontFamily: 'monospace' }"
  />
  <Text
    v-if="gameStore.cardMsg"
    :x="184"
    :y="92"
    :text="gameStore.cardMsg"
    :origin="0.5"
    :scroll-factor="0"
    :style="{ fontSize: '15px', color: '#34d399', fontFamily: 'monospace' }"
  />

  <Circle
    v-if="!isSpotClaimed('spot-pond')"
    :x="spotPos('spot-pond').x"
    :y="spotPos('spot-pond').y"
    :radius="22"
    :fill-color="0x0ea5e9"
    :fill-alpha="0.35"
    :stroke-color="0x38bdf8"
    :stroke-alpha="0.5"
    :line-width="1"
  />
  <Circle
    v-if="!isSpotClaimed('spot-pond')"
    :x="spotPos('spot-pond').x"
    :y="spotPos('spot-pond').y"
    :radius="11"
    :fill-color="0x38bdf8"
    :fill-alpha="0.45"
  />
  <Circle
    v-if="!isSpotClaimed('spot-mushroom')"
    :x="spotPos('spot-mushroom').x"
    :y="spotPos('spot-mushroom').y - 10"
    :radius="9"
    :fill-color="0xef4444"
    :fill-alpha="0.85"
    :stroke-color="0xfca5a5"
    :stroke-alpha="0.6"
    :line-width="1"
  />
  <Rectangle
    v-if="!isSpotClaimed('spot-mushroom')"
    :x="spotPos('spot-mushroom').x - 4"
    :y="spotPos('spot-mushroom').y"
    :width="8"
    :height="12"
    :fill-color="0xd6d3d1"
    :fill-alpha="0.7"
  />
  <Rectangle
    v-if="spotHiddenRevealed"
    :x="spotPos('spot-hidden').x - 2"
    :y="spotPos('spot-hidden').y - 2"
    :width="5"
    :height="5"
    :fill-color="0xfbbf24"
    :fill-alpha="0.25"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type * as Phaser from "phaser";
import {
  Line,
  onPreUpdate,
  Rectangle,
  refPhaserInstance,
  Sprite,
  Text,
  useScene,
} from "phavuer";
import { beginBattle, gameStore, requestScene, addCounter } from "../store";
import { bindKeyboard, unbindKeyboard } from "../input";
import {
  isSpotClaimed,
  SPOTS,
  tryClaimKmMilestone,
  tryClaimSpot,
} from "../cardAcquisition";
import {
  BOSSES,
  GATES,
  SPEED,
  START_X,
  START_Y,
  WORLD_H,
  WORLD_W,
} from "../worldConfig";

defineProps<{ preloaded: boolean }>();

const scene = useScene();
const camera = scene.cameras.main;

const player = refPhaserInstance<Phaser.GameObjects.Sprite>(null);
const flipX = ref(false);
const gateMsg = ref("");

let x = gameStore.worldX;
let y = gameStore.worldY;
let wasMoving = false;
let gateTimer: number | null = null;
let battlePending = false;

const JOY_MAX = 20;
const JOY_DEAD = 10;

let joyPointerId: number | null = null;
let joyOriginX = 0;
let joyOriginY = 0;
let joyVecX = 0;
let joyVecY = 0;
let joyGfx: Phaser.GameObjects.Graphics | null = null;

function drawJoystick() {
  if (!joyGfx) return;
  joyGfx.clear();
  joyGfx.lineStyle(2, 0x22d3ee, 0.1);
  joyGfx.strokeCircle(joyOriginX, joyOriginY, JOY_MAX);
  joyGfx.fillStyle(0x22d3ee, 0.1);
  joyGfx.fillCircle(joyOriginX, joyOriginY, JOY_MAX);
  joyGfx.fillStyle(0x22d3ee, 0.2);
  joyGfx.fillCircle(joyOriginX + joyVecX, joyOriginY + joyVecY, 8);
}

function onJoyDown(pointer: Phaser.Input.Pointer) {
  if (joyPointerId !== null) return;
  joyPointerId = pointer.id;
  joyOriginX = pointer.x;
  joyOriginY = pointer.y;
  joyVecX = 0;
  joyVecY = 0;
  joyGfx = scene.add.graphics();
  joyGfx.setScrollFactor(0);
  joyGfx.setDepth(1000);
  drawJoystick();
}

function onJoyMove(pointer: Phaser.Input.Pointer) {
  if (pointer.id !== joyPointerId) return;
  const dx = pointer.x - joyOriginX;
  const dy = pointer.y - joyOriginY;
  const len = Math.hypot(dx, dy);
  const cl = len > JOY_MAX ? JOY_MAX : len;
  joyVecX = len > 0 ? (dx / len) * cl : 0;
  joyVecY = len > 0 ? (dy / len) * cl : 0;
  gameStore.input.left = joyVecX < -JOY_DEAD;
  gameStore.input.right = joyVecX > JOY_DEAD;
  gameStore.input.up = joyVecY < -JOY_DEAD;
  gameStore.input.down = joyVecY > JOY_DEAD;
  drawJoystick();
}

function onJoyUp(pointer: Phaser.Input.Pointer) {
  if (pointer.id !== joyPointerId) return;
  joyPointerId = null;
  joyGfx?.destroy();
  joyGfx = null;
  gameStore.input.left =
    gameStore.input.right =
    gameStore.input.up =
    gameStore.input.down =
      false;
}

const ownedCards = computed(() =>
  Object.values(gameStore.cards.inventory).reduce((s, h) => s + h.copies, 0),
);

const hudText = computed(
  () =>
    `DIST ${gameStore.progress}m   CARTE ${ownedCards.value}/30   GATES ${gameStore.gatesCleared}/${GATES.length}`,
);

function spotPos(id: string) {
  return SPOTS.find((s) => s.id === id) ?? { x: 0, y: 0 };
}

const spotHiddenRevealed = computed(
  () => gameStore.cards.counters.kmRight >= (SPOTS[2]?.revealAfter ?? 0),
);

onMounted(() => {
  bindKeyboard();
  scene.input.on("pointerdown", onJoyDown);
  scene.input.on("pointermove", onJoyMove);
  scene.input.on("pointerup", onJoyUp);
  scene.input.on("pointerupoutside", onJoyUp);
  const p = player.value;
  watch(
    player,
    (p) => {
      if (p) camera.startFollow(p, true, 0.1, 0.1);
    },
    { immediate: true },
  );
});

onBeforeUnmount(() => {
  unbindKeyboard();
  scene.input.off("pointerdown", onJoyDown);
  scene.input.off("pointermove", onJoyMove);
  scene.input.off("pointerup", onJoyUp);
  scene.input.off("pointerupoutside", onJoyUp);
  if (gateTimer) window.clearTimeout(gateTimer);
  if (cardMsgTimer) window.clearTimeout(cardMsgTimer);
  gameStore.worldX = x;
  gameStore.worldY = y;
  gameStore.input.left =
    gameStore.input.right =
    gameStore.input.up =
    gameStore.input.down =
      false;
});

onPreUpdate((_time, delta) => {
  const p = player.value;
  if (!p || battlePending) return;
  const { left, right, up, down } = gameStore.input;
  const dx = (right ? 1 : 0) - (left ? 1 : 0);
  const dy = (down ? 1 : 0) - (up ? 1 : 0);
  const moving = dx !== 0 || dy !== 0;

  if (moving) {
    const len = Math.hypot(dx, dy);
    const step = (SPEED * delta) / 1000;
    const stepX = (dx / len) * step;
    x += stepX;
    y += (dy / len) * step;
    x = Math.min(Math.max(x, 20), WORLD_W - 20);
    y = Math.min(Math.max(y, 20), WORLD_H - 20);
    p.setPosition(x, y);
    if (stepX > 0) addCounter("kmRight", stepX);
    else if (stepX < 0) addCounter("kmLeft", -stepX);
    if (dx < 0) flipX.value = true;
    else if (dx > 0) flipX.value = false;
    const anim = dy < 0 ? "gomamon-walk-back" : "gomamon-walk-front";
    if (!wasMoving || p.anims.currentAnim?.key !== anim) p.play(anim);
    wasMoving = true;
  } else {
    if (wasMoving) {
      p.stop();
      p.setFrame(0);
    }
    wasMoving = false;
  }

  gameStore.progress = Math.round(x - START_X);
  checkGate();
  checkKmMilestones();
  checkSpots();
});

let cardMsgTimer: number | null = null;

function showCardMsg() {
  if (cardMsgTimer) window.clearTimeout(cardMsgTimer);
  cardMsgTimer = window.setTimeout(() => {
    gameStore.cardMsg = "";
  }, 3000);
}

function checkKmMilestones() {
  const right = tryClaimKmMilestone("right");
  const left = tryClaimKmMilestone("left");
  if (right || left) showCardMsg();
}

function checkSpots() {
  for (const spot of SPOTS) {
    if (isSpotClaimed(spot.id)) continue;
    const dxs = x - spot.x;
    const dys = y - spot.y;
    if (Math.hypot(dxs, dys) < 46) {
      if (tryClaimSpot(spot.id)) showCardMsg();
    }
  }
}

function checkGate() {
  if (battlePending) return;
  const gate = GATES[gameStore.gatesCleared];
  if (gate === undefined) return;
  if (gameStore.progress >= gate) {
    battlePending = true;
    gameStore.worldX = x;
    gameStore.worldY = y;
    beginBattle(gameStore.gatesCleared);
    const boss = BOSSES[gameStore.gatesCleared];
    gateMsg.value = `BOSS GATE ${gameStore.gatesCleared + 1}: ${boss?.name ?? "??"}`;
    gameStore.input.left =
      gameStore.input.right =
      gameStore.input.up =
      gameStore.input.down =
        false;
    if (gateTimer) window.clearTimeout(gateTimer);
    gateTimer = window.setTimeout(() => {
      requestScene("battle");
    }, 1500);
  }
}
</script>

<script lang="ts">
import type * as Phaser from "phaser";
import { WORLD_H, WORLD_W } from "../worldConfig";

export function preloadWorld(scene: Phaser.Scene) {
  scene.load.spritesheet("gomamon-walk", "/sprites/gomamon/walkR.png", {
    frameWidth: 28,
    frameHeight: 28,
  });
}

export function createWorld(scene: Phaser.Scene) {
  if (!scene.anims.exists("gomamon-walk")) {
    scene.anims.create({
      key: "gomamon-walk-front",
      frames: scene.anims.generateFrameNumbers("gomamon-walk", {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: "gomamon-walk-back",
      frames: scene.anims.generateFrameNumbers("gomamon-walk", {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
  scene.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
}
</script>
