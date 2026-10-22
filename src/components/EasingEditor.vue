<script setup>
import { computed, ref } from 'vue';
import { EASING_PRESETS, useMotionStore } from '../stores/motion';
import { replayAll } from '../lib/replay';

/**
 * Edits one easing token: the curve, a preset menu and a Play button that runs a dot along a
 * track with the current curve at the MD duration, and replays the page's own motion (the era ring).
 */
const props = defineProps({
  id: { type: String, required: true },
  /** Called when the menu is grabbed, so a host can flash the token's reach. */
  onGrab: { type: Function, default: null },
});
const motion = useMotionStore();
const pts = computed(() => motion.easings[props.id]);

// The curve lives in a 100×100 box; y is drawn over [-0.5, 1.5] so overshoots stay in view.
const X = x => x * 100;
const Y = y => 100 - (y + 0.5) * 50;
const path = computed(() => {
  const [x1, y1, x2, y2] = pts.value;
  return `M ${X(0)} ${Y(0)} C ${X(x1)} ${Y(y1)}, ${X(x2)} ${Y(y2)}, ${X(1)} ${Y(1)}`;
});

const presetValue = computed(() => {
  const hit = EASING_PRESETS.find(p => p.pts.every((v, i) => v === pts.value[i]));
  return hit ? hit.label : '';
});
function onPreset(e) {
  const p = EASING_PRESETS.find(x => x.label === e.target.value);
  if (p) motion.setEasing(props.id, p.pts);
}

// Play: the dot jumps back to the start without animating, then eases across; the UI plays too.
const playing = ref(false);
function play() {
  replayAll();
  playing.value = false;
  requestAnimationFrame(() => requestAnimationFrame(() => { playing.value = true; }));
}
const grab = () => props.onGrab?.();
</script>

<template>
  <div class="easing">
    <div class="easing__top">
      <svg class="easing__curve" viewBox="0 0 100 100" aria-hidden="true">
        <rect x="0" :y="Y(1)" width="100" :height="Y(0) - Y(1)" class="easing__box" />
        <line :x1="X(0)" :y1="Y(0)" :x2="X(pts[0])" :y2="Y(pts[1])" class="easing__handle" />
        <line :x1="X(1)" :y1="Y(1)" :x2="X(pts[2])" :y2="Y(pts[3])" class="easing__handle" />
        <path :d="path" class="easing__path" />
        <circle :cx="X(pts[0])" :cy="Y(pts[1])" r="3" class="easing__dot" />
        <circle :cx="X(pts[2])" :cy="Y(pts[3])" r="3" class="easing__dot" />
      </svg>
      <div class="easing__side">
        <select class="easing__preset" :value="presetValue" aria-label="Easing preset" @pointerdown="grab" @change="onPreset">
          <option value="" disabled>Custom</option>
          <option v-for="p in EASING_PRESETS" :key="p.label" :value="p.label">{{ p.label }}</option>
        </select>
        <div class="easing__track" :style="{ '--curve': motion.easingCss(id) }">
          <span class="easing__runner" :class="{ 'easing__runner--go': playing }" />
        </div>
        <button class="easing__play t-label" type="button" @click="play">Play</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.easing__top { display: grid; grid-template-columns: 28rem 1fr; gap: 2.4rem; align-items: stretch; }
.easing__curve { width: 28rem; height: 28rem; border: var(--hairline) solid var(--line-soft); border-radius: var(--radius-sm); background: var(--white); }
.easing__box { fill: var(--fill-soft); }
.easing__handle { stroke: var(--muted); stroke-width: 1; }
.easing__path { fill: none; stroke: var(--ink); stroke-width: 2; }
.easing__dot { fill: var(--ink); }
.easing__side { display: flex; flex-direction: column; gap: 1.2rem; min-width: 0; }
.easing__preset {
  height: 8.8rem; padding: 0 2rem;
  font: 600 var(--text-label)/1 var(--font-display);
  color: var(--ink); background: var(--white);
  border: var(--stroke) solid var(--ink); border-radius: var(--radius-sm);
}
.easing__track { position: relative; flex: 1 1 auto; min-height: 4.8rem; border-radius: var(--radius-sm); background: var(--fill-soft); }
.easing__runner {
  position: absolute; top: 50%; left: 0;
  width: 3.6rem; height: 3.6rem; margin-top: -1.8rem;
  border-radius: 50%; background: var(--ink);
}
.easing__runner--go { transform: translateX(calc(100% * 0 + var(--run, 0px))); }
.easing__track { --run: 0px; }
.easing__runner--go { transition: transform var(--dur-md) var(--curve); transform: translateX(calc(28rem - 3.6rem)); }
.easing__play { height: 7.2rem; border: var(--stroke) solid var(--ink); border-radius: var(--radius-sm); background: var(--white); }
</style>
