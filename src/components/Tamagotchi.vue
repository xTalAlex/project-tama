<template>
  <Game :config="gameConfig">
    <Scene name="MainScene" @preload="preloadMain" @create="createMain">
      <template #default="{ preloaded }">
        <MainScene :preloaded="preloaded" />
      </template>
    </Scene>

    <Scene
      name="WorldScene"
      :auto-start="false"
      @preload="preloadWorld"
      @create="createWorld"
    >
      <template #default="{ preloaded }">
        <WorldScene :preloaded="preloaded" />
      </template>
    </Scene>

    <Scene
      name="BattleScene"
      :auto-start="false"
      @preload="preloadBattle"
      @create="createBattle"
    >
      <template #default="{ preloaded }">
        <BattleScene :preloaded="preloaded" />
      </template>
    </Scene>

    <SceneRouter />
  </Game>
</template>

<script setup>
import * as Phaser from "phaser";
import { Game, Scene } from "phavuer";
import MainScene, {
  preloadMain,
  createMain,
} from "../game/scenes/MainScene.vue";
import WorldScene, {
  preloadWorld,
  createWorld,
} from "../game/scenes/WorldScene.vue";
import BattleScene, {
  preloadBattle,
  createBattle,
} from "../game/scenes/BattleScene.vue";
import SceneRouter from "../game/SceneRouter.vue";

const gameConfig = {
  width: 368,
  height: 368,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
</script>
