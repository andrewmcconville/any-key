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

// Labels sit on the far side of the circle from the rail.
const labelStyle = computed(() => ({
  left: rem(props.node.cx),
  top: rem(props.node.above ? cy.value - R - 19 - 80 : cy.value + R + 21),
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
  <div class="node-label" :data-locked="state === 'locked'" :style="labelStyle">
    <div class="name">{{ node.name }}</div>
    <div class="year">{{ node.year }}</div>
  </div>
</template>
