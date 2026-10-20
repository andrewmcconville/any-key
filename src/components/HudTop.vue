<script setup>
import { ref, watch } from 'vue';
import { ERAS } from '../data/content';
import { useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';

const game = useGameStore();
const ui = useUiStore();
const shaking = ref(null);
const pop = ref(false);

function dotState(era) {
  if (!game.isUnlocked(era.id)) return 'locked';
  if (era.id === ui.eraInView) return 'current';
  return game.eraCleared(era.id) ? 'cleared' : 'open';
}

function onDot(era) {
  if (!game.isUnlocked(era.id)) {
    shaking.value = era.id;
    setTimeout(() => { shaking.value = null; }, 400);
    return;
  }
  ui.scrollToEra(era.id);
}

// Pulse the counter whenever it changes
watch(() => game.count, () => {
  pop.value = false;
  requestAnimationFrame(() => { pop.value = true; });
});
</script>

<template>
  <header class="hud-top">
    <div class="eras" aria-label="Eras">
      <button
        v-for="era in ERAS"
        :key="era.id"
        class="era-dot"
        :class="{ shake: shaking === era.id }"
        :data-state="dotState(era)"
        type="button"
        :aria-label="`Era ${era.numeral} · ${era.name}`"
        @click="onDot(era)"
      >{{ era.numeral }}</button>
    </div>
    <div class="hud-total t-heading" aria-live="polite">
      <span>COLLECTED</span>
      <span><span class="count" :class="{ pop }" @animationend="pop = false">{{ game.count }}</span>/{{ game.total }}</span>
    </div>
  </header>
</template>
