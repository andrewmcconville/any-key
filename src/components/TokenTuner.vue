<script setup>
import EasingEditor from './EasingEditor.vue';
import { flashElements } from '../lib/flash';
import { CHANNELS, useColorsStore } from '../stores/colors';
import { DURATION_RANGE, useMotionStore } from '../stores/motion';
import { SHAPE_TOKENS, useShapeStore } from '../stores/shape';
import { TYPE_TOKENS, useTokensStore } from '../stores/tokens';

/**
 * The slider(s) that retune one token, whatever its family, backed by the same stores the global
 * panels use. Grabbing a control flashes `reach()`: the elements the change will touch.
 */
const props = defineProps({
  family: { type: String, required: true },
  tokenId: { type: String, required: true },
  reach: { type: Function, default: () => [] },
});

const tokens = useTokensStore();
const colors = useColorsStore();
const shape = useShapeStore();
const motion = useMotionStore();

const typeToken = TYPE_TOKENS.find(t => t.id === props.tokenId);
const shapeToken = SHAPE_TOKENS.find(t => t.id === props.tokenId);
const fmt = (ch, v) => (ch.key === 'h' ? `${Math.round(v)}°` : v.toFixed(ch.dp));
const grab = () => flashElements(props.reach());
</script>

<template>
  <input
    v-if="family === 'type' && typeToken"
    class="slider"
    type="range"
    :min="typeToken.min" :max="typeToken.max" step="0.1"
    :value="tokens.sizes[tokenId]"
    :aria-label="`${typeToken.label} size`"
    @pointerdown="grab"
    @input="tokens.set(tokenId, $event.target.value)"
  >
  <input
    v-else-if="(family === 'radius' || family === 'border') && shapeToken"
    class="slider"
    type="range"
    :min="shapeToken.min" :max="shapeToken.max" :step="shapeToken.step"
    :value="shape.values[tokenId]"
    :aria-label="`${shapeToken.label} value`"
    @pointerdown="grab"
    @input="shape.set(tokenId, $event.target.value)"
  >
  <input
    v-else-if="family === 'duration'"
    class="slider"
    type="range"
    :min="DURATION_RANGE.min" :max="DURATION_RANGE.max" :step="DURATION_RANGE.step"
    :value="motion.durations[tokenId]"
    :aria-label="`${tokenId} duration`"
    @pointerdown="grab"
    @input="motion.setDuration(tokenId, $event.target.value)"
  >
  <EasingEditor v-else-if="family === 'easing'" :id="tokenId" :on-grab="grab" />
  <template v-else-if="family === 'color'">
    <label v-for="ch in CHANNELS" :key="ch.key" class="channel">
      <span class="channel__key t-label">{{ ch.label }}</span>
      <input
        class="channel__slider"
        type="range"
        :min="ch.min" :max="ch.max" :step="ch.step"
        :value="colors.values[tokenId][ch.key]"
        :aria-label="`${tokenId} ${ch.label}`"
        @pointerdown="grab"
        @input="colors.setChannel(tokenId, ch.key, $event.target.value)"
      >
      <span class="channel__value t-label t-label--lc">{{ fmt(ch, colors.values[tokenId][ch.key]) }}</span>
    </label>
  </template>
</template>

<style scoped>
.slider, .channel__slider {
  display: block;
  width: 100%;
  height: 6.4rem;
  margin: 0;
  accent-color: var(--ink);
  touch-action: pan-y;
}
.channel { display: grid; grid-template-columns: 3.2rem 1fr 8.8rem; align-items: center; gap: 1.6rem; }
.channel__key { color: var(--muted); }
.channel__value { color: var(--muted); text-align: right; font-variant-numeric: tabular-nums; }
</style>
