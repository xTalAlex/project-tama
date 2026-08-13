<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <h2
        class="text-sm font-bold uppercase tracking-widest text-slate-400"
      >
        Collezione
      </h2>
      <span class="text-xs text-cyan-300">
        {{ ownedCount }}/{{ totalPool }} copie
      </span>
    </div>

    <div v-if="gameStore.cardMsg" class="text-xs text-emerald-400">
      {{ gameStore.cardMsg }}
    </div>

    <div class="rounded-lg border border-slate-700 bg-slate-900/70 p-2">
      <p class="mb-1 text-[10px] uppercase tracking-widest text-slate-500">
        Equipaggiate (3)
      </p>
      <div class="flex gap-2">
        <button
          v-for="(slot, i) in gameStore.cards.equipped"
          :key="i"
          type="button"
          class="flex h-16 flex-1 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed transition hover:border-rose-400"
          :class="slot ? 'border-slate-600' : 'border-slate-800'"
          :title="slot ? 'Rimuovi' : 'Vuoto'"
          @click="slot && unequipCard(i)"
        >
          <template v-if="slot">
            <span class="text-lg leading-none">{{ cardOf(slot)?.icon }}</span>
            <span class="max-w-full truncate px-1 text-[9px] font-bold uppercase" :style="{ color: rarityColor(slot) }">
              {{ cardOf(slot)?.name }}
            </span>
            <span class="text-[9px] text-slate-400">
              {{ cardOf(slot)?.kind === "active" ? "attiva" : "passiva" }}
            </span>
          </template>
          <span v-else class="text-sm text-slate-700">—</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-5 gap-1.5">
      <button
        v-for="card in sortedCards"
        :key="card.id"
        type="button"
        class="relative flex aspect-square flex-col items-center justify-center rounded-md border transition"
        :class="[
          owned(card.id) ? 'hover:scale-105 hover:brightness-125' : 'opacity-50',
          equippedIds.includes(card.id) ? 'ring-2 ring-cyan-400' : '',
        ]"
        :style="{ borderColor: rarityColor(card.id), background: 'rgba(15,23,42,0.6)' }"
        :title="card.name"
        @click="onCardClick(card.id)"
      >
        <span class="text-xl leading-none">{{ card.icon }}</span>
        <span v-if="owned(card.id)" class="absolute right-0.5 top-0.5 text-[9px] font-bold" :style="{ color: rarityColor(card.id) }">
          ×{{ owned(card.id) }}
        </span>
        <span v-else-if="poolLeft(card.id) > 0" class="absolute right-0.5 top-0.5 text-[9px] text-slate-500">
          ?
        </span>
      </button>
    </div>

    <div
      v-if="selected"
      class="rounded-lg border p-2 text-xs"
      :style="{ borderColor: rarityColor(selected.id) }"
    >
      <p class="text-sm font-bold uppercase" :style="{ color: rarityColor(selected.id) }">
        {{ selected.icon }} {{ selected.name }}
      </p>
      <p class="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
        {{ rarityLabel(selected.id) }} · {{ selected.kind === "active" ? "ATTIVA" : "PASSIVA" }} ·
        {{
          selected.uses === null
            ? "PERMANENTE"
            : selected.uses + (selected.uses === 1 ? " USO" : " USI")
        }}
        · pool {{ poolLeft(selected.id) }}
      </p>
      <p class="mt-1 text-slate-300">{{ selected.description }}</p>
    </div>

    <div class="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 p-2">
      <button
        type="button"
        class="rounded-lg border-2 border-emerald-500 bg-slate-900 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300 transition hover:bg-emerald-950 active:scale-95"
        @click="feed"
      >
        🍎 Nutri
      </button>
      <span class="text-xs text-slate-400">Pasti: {{ gameStore.cards.counters.feeds }}</span>
      <span class="ml-auto text-[10px] text-slate-500">
        km: {{ Math.round(gameStore.cards.counters.kmRight) }}→ · ←{{ Math.round(gameStore.cards.counters.kmLeft) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  addCounter,
  equipCard,
  gameStore,
  unequipCard,
} from "../game/store";
import {
  CARDS,
  CARD_BY_ID,
  RARITY_META,
  type Card,
} from "../game/cardsConfig";
import { tryClaimFeedMilestone } from "../game/cardAcquisition";

const selectedId = ref<string | null>(null);

const selected = computed<Card | null>(() =>
  selectedId.value ? CARD_BY_ID[selectedId.value] ?? null : null,
);

const sortedCards = computed(() =>
  [...CARDS].sort(
    (a, b) =>
      RARITY_META[a.rarity].order - RARITY_META[b.rarity].order ||
      a.name.localeCompare(b.name),
  ),
);

const ownedCount = computed(() =>
  Object.values(gameStore.cards.inventory).reduce((s, h) => s + h.copies, 0),
);

const totalPool = computed(() =>
  Object.values(gameStore.cards.pool).reduce((s, n) => s + n, 0) +
  ownedCount.value,
);

const equippedIds = computed(() =>
  gameStore.cards.equipped.filter((e): e is string => e !== null),
);

function cardOf(id: string) {
  return CARD_BY_ID[id];
}

function owned(id: string): number {
  return gameStore.cards.inventory[id]?.copies ?? 0;
}

function poolLeft(id: string): number {
  return gameStore.cards.pool[id] ?? 0;
}

function rarityColor(id: string): string {
  const card = CARD_BY_ID[id];
  return RARITY_META[card?.rarity ?? "common"].color;
}

function rarityLabel(id: string): string {
  const card = CARD_BY_ID[id];
  return RARITY_META[card?.rarity ?? "common"].label;
}

function onCardClick(id: string) {
  selectedId.value = id;
  if (owned(id) <= 0) return;
  if (equippedIds.value.includes(id)) {
    const slot = gameStore.cards.equipped.indexOf(id);
    if (slot !== -1) unequipCard(slot);
  } else {
    equipCard(id);
  }
}

function feed() {
  addCounter("feeds", 1);
  tryClaimFeedMilestone();
}
</script>
