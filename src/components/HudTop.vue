<script setup>
import { computed, ref, watch } from 'vue';
import { useOverlayNav } from '../composables/useOverlayNav';
import { useGameStore } from '../stores/game';
import { useFlightStore } from '../stores/flight';
import { useUiStore } from '../stores/ui';
import Corona from './Corona.vue';

const game = useGameStore();
const ui = useUiStore();
const flight = useFlightStore();
const nav = useOverlayNav();
const pop = ref(false);

// The count the gauge shows: the real one, except while a collected key's cap is still flying up
// from its modal (see KeyFlight.vue), when it holds the old count until the cap lands.
const shown = computed(() => (ui.flight ? ui.flight.countBefore : game.count));

// Pulse the counter whenever it changes
watch(shown, () => {
  pop.value = false;
  requestAnimationFrame(() => { pop.value = true; });
});

// The ring: a circle of radius R in a 100-unit box, drawn as one dash the length of the collected
// share. It fills clockwise from the top (the svg is turned a quarter back).
const R = 45;
const LAP = 2 * Math.PI * R;
const dashOffset = computed(() => LAP * (1 - shown.value / game.total));
</script>

<template>
  <header class="hud-top">
    <button class="hud-btn" type="button" aria-label="Menu" @click="nav.open('menu')">
      <svg viewBox="0 0 56 56" aria-hidden="true"><path d="M12 17h32M12 28h32M12 39h32" /></svg>
    </button>
    <!-- The gauge: the key count inside a ring that fills as keys are collected, in a corona.
         Play (Inspect, the Collect window) sends a demo cap up to it. -->
    <div class="gauge" data-replay @motion-replay="flight.play()">   <!-- the count is announced by TimelineView -->
      <Corona />
      <svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
        <circle class="ring__track" cx="50" cy="50" :r="R" />
        <circle class="ring__fill" :class="{ 'ring__fill--empty': !shown }" cx="50" cy="50" :r="R" :stroke-dasharray="LAP" :stroke-dashoffset="dashOffset" />
      </svg>
      <span class="count t-heading" :class="{ pop }" @animationend="pop = false">{{ shown }}</span>
      <span class="gauge__label">of {{ game.total }} keys</span>
    </div>
    <button class="hud-btn" type="button" aria-label="Stats" @click="nav.open('stats')">
      <svg viewBox="0 0 56 56" aria-hidden="true"><path d="M14 42V28M28 42V14M42 42V34" /></svg>
    </button>
  </header>
</template>

<style scoped>
.hud-top {
  flex: 0 0 auto;
  height: calc(16.8rem + var(--safe-top));
  padding-top: var(--safe-top);
  /* Inset from the stage edges by --hud-gutter; the border runs down both sides and along the bottom, with rounded bottom corners. */
  width: calc(min(100%, var(--phone-w)) - 2 * var(--hud-gutter));
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: calc(4.8rem + var(--safe-left)) calc(4.8rem + var(--safe-right));
  background: var(--bar);
  border: var(--hairline) solid var(--line-soft);
  border-top: 0;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  z-index: 3;
}
/* Bare glyphs, no circle: the same tap target as an era dot, so the two bars still line up. Menu left, Stats right, so the gauge sits at centre. */
.hud-btn {
  position: relative;
  width: var(--tap); height: var(--tap);
  border: 0;
  background: none;
  padding: 0;
  display: grid; place-items: center;
  transition: transform var(--dur-xs) var(--ease-standard);
}
/* The touch target reaches --hit, the full height of the bar, without moving the glyph. */
.hud-btn::before {
  content: ''; position: absolute; left: 50%; top: 50%; translate: -50% -50%;
  width: var(--hit); height: var(--hit);
}
.hud-btn:active { transform: scale(.94); }
.hud-btn svg { width: var(--icon); height: var(--icon); stroke: var(--ink); stroke-width: 5; stroke-linecap: round; fill: none; }
/* The gauge is a tap-sized circle; its stacking is isolated so the corona can sit behind the ring and the count. */
.gauge {
  position: relative; isolation: isolate;
  width: var(--tap); height: var(--tap);
  display: grid; place-items: center;
}
.ring { position: absolute; inset: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
.ring__track, .ring__fill { fill: none; stroke-width: 5; }
.ring__track { stroke: var(--white); }
.ring__fill { stroke: var(--ink); stroke-linecap: round; transition: stroke-dashoffset var(--dur-md) var(--ease-standard); }
/* With nothing collected the round cap would still show as a dot, so the fill hides until the first key. */
.ring__fill--empty { opacity: 0; }
.count { position: relative; font-variant-numeric: tabular-nums; }
.gauge__label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
/* Pulse the count when it changes */
@keyframes pop { 50% { transform: scale(1.18); } }
.pop { animation: pop var(--dur-md) var(--ease-standard); display: inline-block; }
</style>
