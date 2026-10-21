<script setup>
import { ERAS } from '../data/content';
import { useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';

const game = useGameStore();
const ui = useUiStore();

// locked → dashed, open → white, cleared → white + ✓. One ring slides to the era in view.
function dotState(era) {
  if (!game.isUnlocked(era.id)) return 'locked';
  return game.eraCleared(era.id) ? 'cleared' : 'open';
}

// Every dot is a jump, locked or not: a locked era is still worth looking at, and its
// region on the board explains what unlocks it.
</script>

<template>
  <div class="eras" aria-label="Eras">
    <div class="era-ring" :style="{ '--era-index': ui.eraInView - 1 }" aria-hidden="true" />
    <button
      v-for="era in ERAS"
      :key="era.id"
      class="era-dot"
      :data-state="dotState(era)"
      :aria-current="era.id === ui.eraInView ? 'location' : null"
      type="button"
      :aria-label="`Era ${era.numeral} · ${era.name}`"
      @click="ui.scrollToEra(era.id)"
    >{{ era.numeral }}</button>
  </div>
</template>

<style scoped>
.eras { --dot: var(--tap); --dot-gap: 2.4rem; position: relative; display: flex; gap: var(--dot-gap); }
.era-dot {
  width: var(--dot); height: var(--dot);
  border-radius: 50%;
  border: var(--stroke) solid var(--ink);
  display: grid; place-items: center;
  font: 500 var(--text-label)/1 var(--font-display);
  color: var(--ink);
  background: var(--white);
  position: relative;
  transition: background var(--dur-sm) var(--ease-standard), color var(--dur-sm) var(--ease-standard), border-color var(--dur-sm) var(--ease-standard);
}
.era-dot[data-state="locked"] { border-style: dashed; border-color: var(--muted); color: var(--muted); background: transparent; }
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
  content: '✓'; position: absolute; right: -0.8rem; top: -0.8rem;
  width: 4.8rem; height: 4.8rem; border-radius: 50%;
  background: var(--ink); color: var(--white);
  font: 600 3.2rem/4.8rem var(--font-body); text-align: center;
}
</style>
