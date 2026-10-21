<script setup>
import { computed, ref } from 'vue';
import { RAIL_Y } from '../data/content';
import { useGameStore } from '../stores/game';

const props = defineProps({
  node: { type: Object, required: true },   // a KEYS entry with cx / cy / above
  hudTop: { type: Number, default: 168 },   // canvas px removed from board-space y
});
const emit = defineEmits(['press']);

const game = useGameStore();
const R = 108;                              // circle radius, canvas px
const rem = n => `${n / 10}rem`;
const cy = computed(() => props.node.cy - props.hudTop);
const railY = RAIL_Y - props.hudTop;

const state = computed(() => game.keyState(props.node));
const glyph = computed(() => (state.value === 'collected' ? '✓' : state.value === 'locked' ? '?' : 'PRESS'));

const connectorStyle = computed(() => props.node.above
  ? { left: rem(props.node.cx), top: rem(cy.value + R), height: rem(railY - (cy.value + R)) }
  : { left: rem(props.node.cx), top: rem(railY), height: rem((cy.value - R) - railY) });

// Labels sit on the far side of the circle from the rail: 19 canvas px above the circle (anchored by
// their bottom edge, so the type size doesn't matter) or 21 below it.
const labelStyle = computed(() => ({
  left: rem(props.node.cx),
  top: rem(props.node.above ? cy.value - R - 19 : cy.value + R + 21),
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
  <div class="rail-dot" :style="{ left: rem(node.cx) }" />
  <button
    class="node"
    :class="{ shake: shaking }"
    :data-state="state"
    :style="{ left: rem(node.cx), top: rem(cy) }"
    type="button"
    :aria-label="`${node.name}, ${node.year}`"
    :aria-disabled="state === 'locked'"
    @click="onPress"
    @animationend="shaking = false"
  >
    <span class="glyph">{{ glyph }}</span>
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
  transition: transform .12s, background .2s, color .2s;
}
.node:active { transform: scale(.94); }
.node .glyph { font: 500 var(--text-label)/var(--lh-label) var(--font-display); letter-spacing: .02em; }
.node[data-state="collected"] { background: var(--ink); color: var(--white); }
.node[data-state="collected"] .glyph { font: 600 7.2rem/1 var(--font-body); }
.node[data-state="locked"] { border-style: dashed; background: transparent; cursor: default; }
.node[data-state="locked"] .glyph { font: 600 4rem/1 var(--font-body); color: var(--muted); }
.node.shake { animation: shake .4s; }
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
}
</style>
