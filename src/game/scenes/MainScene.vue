<template>
  <!-- Sfondo tech -->
  <Rectangle
    :x="0"
    :y="0"
    :width="368"
    :height="368"
    :fill-color="0x0b1220"
    :origin="0"
  />

  <Line
    v-for="i in 7"
    :key="'gv' + i"
    :x1="46 * i"
    :y1="0"
    :x2="46 * i"
    :y2="368"
    :stroke-color="0x182742"
    :line-width="1"
  />
  <Line
    v-for="i in 7"
    :key="'gh' + i"
    :x1="0"
    :y1="46 * i"
    :x2="368"
    :y2="46 * i"
    :stroke-color="0x182742"
    :line-width="1"
  />

  <Rectangle :x="92" :y="92" :width="4" :height="4" :fill-color="0x22d3ee" />
  <Rectangle :x="276" :y="92" :width="4" :height="4" :fill-color="0x22d3ee" />
  <Rectangle :x="92" :y="230" :width="4" :height="4" :fill-color="0x22d3ee" />
  <Rectangle :x="276" :y="230" :width="4" :height="4" :fill-color="0x22d3ee" />
  <Rectangle :x="184" :y="138" :width="4" :height="4" :fill-color="0x34d399" />
  <Rectangle :x="46" :y="46" :width="4" :height="4" :fill-color="0x34d399" />
  <Rectangle :x="322" :y="322" :width="4" :height="4" :fill-color="0x34d399" />

  <!-- Pannello console -->
  <Rectangle
    :x="0"
    :y="312"
    :width="368"
    :height="56"
    :fill-color="0x0f172a"
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
  <Rectangle
    :x="24"
    :y="336"
    :width="40"
    :height="8"
    :radius="2"
    :fill-color="0x34d399"
  />
  <Rectangle
    :x="72"
    :y="336"
    :width="40"
    :height="8"
    :radius="2"
    :fill-color="0x0e7490"
  />
  <Rectangle
    :x="120"
    :y="336"
    :width="40"
    :height="8"
    :radius="2"
    :fill-color="0x0e7490"
  />

  <Sprite
    v-if="preloaded"
    texture="gomamon-idle"
    play="gomamon-idle"
    :x="184"
    :y="184"
    :scale="1.6"
  />
</template>

<script setup lang="ts">
import { Sprite, Rectangle, Line } from "phavuer";

defineProps<{ preloaded: boolean }>();
</script>

<script lang="ts">
import type * as Phaser from "phaser";

export function preloadMain(scene: Phaser.Scene) {
  scene.load.spritesheet("gomamon-idle", "/sprites/gomamon/idle.png", {
    frameWidth: 56,
    frameHeight: 56,
  });
  scene.load.audio("bgm", "/audio/welcome-to-this-wonderful-space.mp3");
}

export function createMain(scene: Phaser.Scene) {
  let destroyed = false;
  const music = scene.sound.add("bgm", { loop: true, volume: 0.25 });
  if (scene.sound.locked) {
    scene.sound.once("unlocked", () => music.play());
  } else {
    if (!destroyed) music.play();
  }
  scene.events.once("shutdown", () => {
    destroyed = true;
    music.stop();
    music.destroy();
  });
  scene.anims.create({
    key: "gomamon-idle",
    frames: scene.anims.generateFrameNumbers("gomamon-idle", {
      start: 0,
      end: 2,
    }),
    frameRate: 3,
    repeat: -1,
  });
}
</script>
