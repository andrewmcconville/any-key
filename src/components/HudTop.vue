<script setup>
import { ref, watch } from 'vue';
import { ERAS } from '../data/content';
import { useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';

const game = useGameStore();
const ui = useUiStore();
const shaking = ref(null);
const pop = ref(false);

// locked → dashed, open → white, cleared → white + ✓. One ring slides to the era in view.
function dotState(era) {
  if (!game.isUnlocked(era.id)) return 'locked';
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
      <div class="era-ring" :style="{ '--era-index': ui.eraInView - 1 }" aria-hidden="true" />
      <button
        v-for="era in ERAS"
        :key="era.id"
        class="era-dot"
        :class="{ shake: shaking === era.id }"
        :data-state="dotState(era)"
        :aria-current="era.id === ui.eraInView ? 'location' : null"
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

<style scoped>
.hud-top {
  flex: 0 0 16.8rem;
  height: 16.8rem;
  width: 100%;
  max-width: var(--phone-w);
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4.8rem;
  background: #efefef;
  border-bottom: 0.2rem solid var(--line-soft);
  z-index: 3;
}
.eras { --dot: 9.6rem; --dot-gap: 2.4rem; position: relative; display: flex; gap: var(--dot-gap); }
.era-dot {
  width: var(--dot); height: var(--dot);
  border-radius: 50%;
  border: var(--stroke) solid var(--ink);
  display: grid; place-items: center;
  font: 500 3.2rem/1 var(--font-display);
  color: var(--ink);
  background: var(--white);
  position: relative;
  transition: background .2s, color .2s, border-color .2s;
}
.era-dot[data-state="locked"] { border-style: dashed; border-color: var(--muted); color: var(--muted); background: transparent; }
.era-dot.shake { animation: shake .4s; }
/* One ring, 1rem outside the dot, slides along the row to the era in view (--era-index). */
.era-ring {
  position: absolute; left: -1rem; top: -1rem;
  width: calc(var(--dot) + 2rem); height: calc(var(--dot) + 2rem);
  border: var(--stroke) solid var(--ink); border-radius: 50%;
  pointer-events: none;
  transform: translateX(calc(var(--era-index, 0) * (var(--dot) + var(--dot-gap))));
  transition: transform .35s cubic-bezier(.2, .7, .2, 1);
}
.era-dot[data-state="cleared"]::after {
  content: '✓'; position: absolute; right: -0.6rem; top: -0.6rem;
  width: 3.6rem; height: 3.6rem; border-radius: 50%;
  background: var(--ink); color: var(--white);
  font: 600 2.4rem/3.6rem var(--font-body); text-align: center;
}
.hud-total { display: flex; gap: 1.2rem; }
.hud-total .count { min-width: 2.9rem; text-align: right; }
/* Pulse the count when it changes */
@keyframes pop { 50% { transform: scale(1.18); } }
.pop { animation: pop .3s; display: inline-block; }
</style>
