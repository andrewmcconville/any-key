<script setup>
import { computed, onMounted, ref } from 'vue';
import { RAIL_Y } from '../data/content';
import { photoBounds, photoUrl } from '../lib/photos';
import { useGameStore } from '../stores/game';

const props = defineProps({
  node: { type: Object, required: true },   // a KEYS entry with cx / cy / above
  hudTop: { type: Number, default: 168 },   // canvas px removed from board-space y
});
const emit = defineEmits(['press']);

const game = useGameStore();
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

const connectorStyle = computed(() => props.node.above
  ? { left: rem(props.node.cx), top: rem(bottomEdge.value), height: rem(railY - bottomEdge.value) }
  : { left: rem(props.node.cx), top: rem(railY), height: rem(topEdge.value - railY) });

// Labels sit on the far side of the node from the rail: 19 canvas px above it (anchored by their
// bottom edge, so the type size doesn't matter) or 21 below it.
const labelStyle = computed(() => ({
  left: rem(props.node.cx),
  top: rem(props.node.above ? topEdge.value - 19 : bottomEdge.value + 21),
}));

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
  <div class="connector" :style="connectorStyle" />
  <div class="rail-dot" :class="{ 'rail-dot--check': photo && state === 'collected' }" :style="{ left: rem(node.cx) }" />
  <button
    class="node"
    :class="{ shake: shaking, 'node--photo': photo }"
    :data-state="state"
    :style="{ left: rem(node.cx), top: rem(cy) }"
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
    <div class="name">{{ node.name }}</div>
    <div class="year">{{ node.year }}</div>
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
  width: 0; margin-left: -0.15rem;
  border-left: 0.3rem dashed var(--muted);
  pointer-events: none;
}
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
