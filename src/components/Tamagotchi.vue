<template>
  <Game :config="gameConfig">
    <Scene name="MainScene">
      <Rectangle :x="184" :y="184" :width="64" :height="64" :fillColor="0xAAAAAA" />
    </Scene>
  </Game>
</template>

<script setup>
    import { Game, Scene, Rectangle } from 'phavuer'
    const gameConfig = { width: 368, height: 368 }
</script>