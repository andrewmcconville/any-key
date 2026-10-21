<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { ERAS } from '../data/content';
import { useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';

const game = useGameStore();
const ui = useUiStore();

// The ring is a pill that stretches to the era in view: its leading edge sets off first and the
// trailing edge follows after --ring-lag, so it elongates toward the target and snaps shut there.
// Which edge leads depends on the direction of travel (data-dir), compared here on every change.
const ring = ref(null);
const preview = ref(null);                                   // index while a replay runs
const index = computed(() => preview.value ?? ui.eraInView - 1);
const dir = ref('fwd');
watch(index, (next, prev) => { dir.value = next >= prev ? 'fwd' : 'back'; });

// Replay, for the Inspect tool's Play button: slide to a neighbouring era and back.
let replayTimer = null;
function replay() {
  const here = ui.eraInView - 1;
  const there = here + 1 < ERAS.length ? here + 1 : here - 1;
  const cs = getComputedStyle(ring.value);
  const ms = s => { const n = parseFloat(s) || 0; return /ms\s*$/.test(s) ? n : n * 1000; };
  const travel = ms(cs.getPropertyValue('--ring-duration')) + ms(cs.getPropertyValue('--ring-lag'));
  clearTimeout(replayTimer);
  preview.value = there;
  replayTimer = setTimeout(() => { preview.value = null; }, travel + 150);
}
onBeforeUnmount(() => clearTimeout(replayTimer));

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
    <div
      ref="ring"
      class="era-ring"
      :style="{ '--era-index': index }"
      :data-dir="dir"
      data-replay
      aria-hidden="true"
      @motion-replay="replay"
    />
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
/* One ring, 1rem outside the dot, stretches along the row to the era in view (--era-index). Its two
   edges are positioned separately (left and right insets) so they can move at different times. The
   --ring-* properties are this component's knobs: the Inspect tool lists and tunes them. */
.era-ring {
  --ring-duration: var(--dur-md);
  --ring-lag: 0.08s;
  --ring-ease-lead: var(--ease-emphasized);
  --ring-ease-trail: var(--ease-standard);
  --step: calc(var(--dot) + var(--dot-gap));
  position: absolute; top: -1rem;
  height: calc(var(--dot) + 2rem);
  left: calc(var(--era-index, 0) * var(--step) - 1rem);
  right: calc(100% - var(--era-index, 0) * var(--step) - var(--dot) - 1rem);
  border: var(--stroke) solid var(--ink);
  border-radius: calc(var(--dot) / 2 + 1rem);
  pointer-events: none;
}
.era-ring[data-dir="fwd"]  { transition: right var(--ring-duration) var(--ring-ease-lead), left var(--ring-duration) var(--ring-ease-trail) var(--ring-lag); }
.era-ring[data-dir="back"] { transition: left var(--ring-duration) var(--ring-ease-lead), right var(--ring-duration) var(--ring-ease-trail) var(--ring-lag); }
.era-dot[data-state="cleared"]::after {
  content: '✓'; position: absolute; right: -0.8rem; top: -0.8rem;
  width: 4.8rem; height: 4.8rem; border-radius: 50%;
  background: var(--ink); color: var(--white);
  font: 600 3.2rem/4.8rem var(--font-body); text-align: center;
}
</style>
