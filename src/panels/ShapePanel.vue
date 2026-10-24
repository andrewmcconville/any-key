<script setup>
import FloatingPanel from '../components/FloatingPanel.vue';
import PanelActions from '../components/PanelActions.vue';
import { useRemPx } from '../composables/useRemPx';
import { SHAPE_GROUPS, SHAPE_TOKENS, useShapeStore } from '../stores/shape';

const shape = useShapeStore();
const { remPx, px } = useRemPx();

const inGroup = key => SHAPE_TOKENS.filter(t => t.group === key);

// The sample square draws the token on itself: a border token as its outline, a radius token as its corners.
const sampleStyle = t => (t.group === 'border'
  ? { borderWidth: `${shape.values[t.id]}rem` }
  : { borderRadius: `${shape.values[t.id]}rem` });

// The values as they belong in styles.css, plus the px they rendered at on this screen.
function snapshot() {
  const lines = SHAPE_TOKENS.map(t =>
    `  --${t.id}: ${shape.values[t.id]}rem;   /* ${px(shape.values[t.id])}px${shape.isDefault(t.id) ? '' : ', changed'} */`);
  return [
    `/* Any Key border and radius tokens — ${window.innerWidth}×${window.innerHeight}, 1rem = ${remPx.value.toFixed(2)}px */`,
    ':root {', ...lines, '}',
  ].join('\n');
}
</script>

<template>
  <FloatingPanel id="shape" title="Borders & radii">
    <section v-for="g in SHAPE_GROUPS" :key="g.key" class="group">
      <h3 class="group__title t-label muted">{{ g.label }}</h3>
      <div v-for="t in inGroup(g.key)" :key="t.id" class="token">
        <div class="token__head">
          <span class="token__sample" :class="`token__sample--${t.group}`" :style="sampleStyle(t)" aria-hidden="true" />
          <span class="token__text">
            <span class="token__name t-strong">{{ t.label }}</span>
            <span class="token__note t-label t-label--lc muted">{{ t.note }}</span>
          </span>
          <span class="token__value t-label t-label--lc">
            {{ px(shape.values[t.id]) }}px
            <button v-if="!shape.isDefault(t.id)" class="token__reset" type="button" @click="shape.resetOne(t.id)">reset</button>
          </span>
        </div>
        <input
          class="token__slider"
          type="range"
          :min="t.min"
          :max="t.max"
          :step="t.step"
          :value="shape.values[t.id]"
          :aria-label="`${g.label} ${t.label}`"
          @input="shape.set(t.id, $event.target.value)"
        >
      </div>
    </section>
    <template #footer><PanelActions :snapshot="snapshot" @reset="shape.reset()" /></template>
  </FloatingPanel>
</template>

<style scoped>
.group { margin-bottom: 2.4rem; }
.group__title { margin: 0 0 1.6rem; }
.token { margin-bottom: 2.4rem; }
.token__head { display: flex; align-items: center; gap: 2rem; margin-bottom: 0.8rem; }
/* One square per token, drawn with the token itself so the slider's effect is visible in place. */
.token__sample {
  flex: 0 0 auto;
  width: 8rem; height: 8rem;
  box-sizing: border-box;
  border: 0 solid var(--ink);
  background: var(--white);
  transition: border-width var(--dur-xs), border-radius var(--dur-xs);
}
.token__sample--radius { border-width: 0.3rem; }
.token__text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.token__note { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.token__value { color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; text-align: right; }
.token__reset {
  margin-left: 1.2rem;
  color: var(--ink);
  text-decoration: underline;
  font: inherit;
}
.token__slider {
  display: block;
  width: 100%;
  height: 6.4rem;
  margin: 0;
  accent-color: var(--ink);
  touch-action: pan-y;
}
</style>
