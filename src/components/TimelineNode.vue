<script setup>
import { computed, onMounted, ref } from 'vue';
import { RAIL_Y } from '../data/content';
import { photoBounds, photoUrl } from '../lib/photos';
import { useGameStore } from '../stores/game';
import { useSwingStore } from '../stores/swing';

const props = defineProps({
  node: { type: Object, required: true },   // a KEYS entry with cx / cy / above
  hudTop: { type: Number, default: 168 },   // canvas px removed from board-space y
  lag: { type: Number, default: 0 },        // canvas px the key trails the rail by while the board scrolls
});
const emit = defineEmits(['press']);

const game = useGameStore();
const swing = useSwingStore();
// A key with a photo shows the keycap itself in place of the circle, a little larger since the
// photo has white around the cap; its labels and connector keep clear of it the same way.
const photo = computed(() => photoUrl(props.node.photo));
const R = computed(() => (photo.value ? 170 : 108));   // the node's radius, canvas px
// Where the node's visible top and bottom are, in canvas px: the circle's edges, or for a photo the
// cap's own edges once the photo has loaded and been measured (until then, the box's).
const img = ref(null);
const bounds = ref(null);
async function measure() {
  const el = img.value;
  if (!el) return;
  try { await el.decode(); } catch (_) { return; }   // the pixels must be there to read
  if (el.naturalWidth) bounds.value = photoBounds(el);
}
onMounted(measure);
const topEdge = computed(() => cy.value - R.value * (bounds.value ? 1 - 2 * bounds.value.top : 1));
const bottomEdge = computed(() => cy.value + R.value * (bounds.value ? 2 * bounds.value.bottom - 1 : 1));
const rem = n => `${n / 10}rem`;
const cy = computed(() => props.node.cy - props.hudTop);
const railY = RAIL_Y - props.hudTop;

const state = computed(() => game.keyState(props.node));
const glyph = computed(() => (state.value === 'collected' ? '✓' : state.value === 'locked' ? '?' : 'PRESS'));

// The key hangs from (or stands on) the rail by its connector, a flexible rod rooted at the rail
// dot. While the board scrolls the key trails the rail by `lag` and the rod bends to reach it: it
// leaves the rail vertically and meets the key square to the key's face, which is tilted by the
// rod's angle at the key's centre (a hanging key turns the opposite way from a standing one).
// The name and year trail the key in turn, a little further each, like a chain. The tilt, bend
// and trail factors are the Scroll physics window's knobs (stores/swing.js).
const rod = computed(() => (props.node.above ? railY - bottomEdge.value : topEdge.value - railY));
const tilt = computed(() => (props.node.above ? 1 : -1) * swing.settings.tilt * Math.atan2(props.lag, Math.abs(railY - cy.value)));
// The connector as an SVG in canvas px. Its box runs from the rail to the key's edge and is wide
// enough for the key's whole swing (Safari clips an SVG to its box whatever its overflow), with
// x = W/2 at the key's rest position; the path is a cubic whose handles reach `bend` of the way.
const connector = computed(() => {
  const H = Math.max(1, rod.value);
  const W = 2 * (swing.settings.maxLag + 12);
  const h = swing.settings.bend * H;
  const x0 = W / 2;
  const x = x0 + props.lag;
  const t = tilt.value;
  const d = props.node.above
    // rail at the bottom (x0, H), key edge at the top (x, 0); into the key along its local up
    ? `M ${x0} ${H} C ${x0} ${H - h}, ${x - h * Math.sin(t)} ${h * Math.cos(t)}, ${x} 0`
    // rail at the top (x0, 0), key edge at the bottom (x, H); into the key along its local down
    : `M ${x0} 0 C ${x0} ${h}, ${x + h * Math.sin(t)} ${H - h * Math.cos(t)}, ${x} ${H}`;
  return { W, H, d };
});
const connectorStyle = computed(() => ({
  left: rem(props.node.cx - connector.value.W / 2),
  top: rem(props.node.above ? bottomEdge.value : railY),
  width: rem(connector.value.W),
  height: rem(connector.value.H),
}));
const nodeStyle = computed(() => ({
  left: rem(props.node.cx + props.lag),
  top: rem(cy.value),
  rotate: `${tilt.value}rad`,
}));

// Labels sit on the far side of the node from the rail: 19 canvas px above it (anchored by their
// bottom edge, so the type size doesn't matter) or 21 below it.
const labelStyle = computed(() => ({
  left: rem(props.node.cx + props.lag),
  top: rem(props.node.above ? topEdge.value - 19 : bottomEdge.value + 21),
}));
const nameStyle = computed(() => ({ translate: rem(props.lag * swing.settings.nameTrail) }));
const yearStyle = computed(() => ({ translate: rem(props.lag * swing.settings.yearTrail) }));

const shaking = ref(false);
function onPress() {
  if (state.value === 'locked') {
    shaking.value = false;
    requestAnimationFrame(() => { shaking.value = true; });
    return;
  }
  emit('press', props.node);
}
</script>

<template>
  <svg class="connector" :style="connectorStyle" :viewBox="`0 0 ${connector.W} ${connector.H}`" aria-hidden="true">
    <path :d="connector.d" />
  </svg>
  <div class="rail-dot" :class="{ 'rail-dot--check': photo && state === 'collected' }" :style="{ left: rem(node.cx) }" />
  <button
    class="node"
    :class="{ shake: shaking, 'node--photo': photo }"
    :data-state="state"
    :style="nodeStyle"
    type="button"
    :aria-label="`${node.name}, ${node.year}`"
    :aria-disabled="state === 'locked'"
    @click="onPress"
    @animationend="shaking = false"
  >
    <img v-if="photo" ref="img" class="photo" :src="photo" alt="" draggable="false" @load="measure">
    <span v-else class="glyph">{{ glyph }}</span>
  </button>
  <div class="node-label" :class="{ 'node-label--above': node.above }" :data-locked="state === 'locked'" :style="labelStyle">
    <div class="name" :style="nameStyle">{{ node.name }}</div>
    <div class="year" :style="yearStyle">{{ node.year }}</div>
  </div>
</template>

<style scoped>
.node {
  position: absolute;
  width: 21.6rem; height: 21.6rem;
  margin: -10.8rem 0 0 -10.8rem;
  border-radius: 50%;
  border: var(--stroke) solid var(--ink);
  background: var(--white);
  display: grid; place-items: center;
  color: var(--ink);
  transition: transform var(--dur-xs) var(--ease-standard), background var(--dur-sm) var(--ease-standard), color var(--dur-sm) var(--ease-standard);
}
.node:active { transform: scale(.94); }
.node .glyph { font: 500 var(--text-label)/var(--lh-label) var(--font-display); letter-spacing: .02em; }
.node[data-state="collected"] { background: var(--ink); color: var(--white); }
.node[data-state="collected"] .glyph { font: 600 7.2rem/1 var(--font-body); }
.node[data-state="locked"] { border-style: dashed; background: transparent; cursor: default; }
.node[data-state="locked"] .glyph { font: 600 4rem/1 var(--font-body); color: var(--muted); }
.node.shake { animation: shake var(--dur-lg) var(--ease-standard); }
/* A photographed key: the cap itself, no circle; the photo is shot on paper-white so its edges vanish.
   Locked it is grey and faint; collected, the ✓ sits where its connector meets the rail (see .rail-dot--check). */
.node--photo {
  width: 34rem; height: 34rem;
  margin: -17rem 0 0 -17rem;
  border: 0; border-radius: var(--radius-xs);
}
/* No fill in any state (the collected rule above would paint it ink); the rail dot carries the state. */
.node--photo[data-state] { background: none; }
.node--photo .photo {
  /* Pinned to the box rather than sized by percentages: the button's grid row is auto, so a
     percentage height would fall back to the image's own aspect ratio and a portrait photo would
     spill below the box. The box is always square; a portrait cap is letterboxed inside it. */
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: contain;
  transition: filter var(--dur-sm) var(--ease-standard), opacity var(--dur-sm) var(--ease-standard);
}
.node--photo[data-state="locked"] .photo { filter: grayscale(1); opacity: 0.45; }
.node-label {
  position: absolute;
  width: 36rem; margin-left: -18rem;
  text-align: center;
  pointer-events: none;
}
.node-label--above { transform: translateY(-100%); }
.node-label .name { font: 400 var(--text-body)/var(--lh-body) var(--font-body); }
.node-label .year { font: 500 var(--text-label)/var(--lh-label) var(--font-display); color: var(--muted); letter-spacing: .02em; }
.node-label[data-locked="true"] { color: var(--muted); }
.connector {
  position: absolute;
  overflow: visible;      /* a safety margin; the box already covers the key's whole swing */
  pointer-events: none;
}
/* Stroke in canvas px (the viewBox's units): 3 = 0.3rem, dashed like the border it replaced. */
.connector path { fill: none; stroke: var(--muted); stroke-width: 3; stroke-dasharray: 9 9; }
.rail-dot {
  position: absolute;
  width: 2.4rem; height: 2.4rem; margin: -1.2rem 0 0 -1.2rem;
  border-radius: 50%; background: var(--ink);
  top: calc(126rem - 16.8rem);
  transition: width var(--dur-sm) var(--ease-standard), height var(--dur-sm) var(--ease-standard), margin var(--dur-sm) var(--ease-standard);
}
/* A collected photographed key: the junction grows into the ✓ badge, the same as a cleared era dot's. */
.rail-dot--check {
  width: 6.4rem; height: 6.4rem; margin: -3.2rem 0 0 -3.2rem;
  color: var(--white);
  font: 600 4rem/6.4rem var(--font-body); text-align: center;
}
.rail-dot--check::after { content: '✓'; }
</style>
