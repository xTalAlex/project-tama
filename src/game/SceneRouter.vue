<template></template>

<script setup lang="ts">
import { watch } from "vue";
import { useGame } from "phavuer";
import { gameStore } from "./store";

const game = useGame();

watch(
  () => gameStore.sceneRequest,
  (req) => {
    if (req) {
      gameStore.sceneRequest = "";
      const target =
        req === "world"
          ? "WorldScene"
          : req === "battle"
            ? "BattleScene"
            : "MainScene";
      if (!game.scene.isActive(target)) {
        game.scene.stop("MainScene");
        game.scene.stop("WorldScene");
        game.scene.stop("BattleScene");
        game.scene.start(target);
      }
    }
  },
);
</script>
