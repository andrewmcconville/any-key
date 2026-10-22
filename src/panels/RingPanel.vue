<script setup>
import FloatingPanel from '../components/FloatingPanel.vue';
import PanelActions from '../components/PanelActions.vue';
import { RING_CONTROLS, RING_EASINGS, useRingStore } from '../stores/ring';

/** The Era ring window: the knobs tune the ring's stretch; the title bar's play slides it over and back. */
const ring = useRingStore();
</script>

<template>
  <FloatingPanel id="ring" title="Era ring">
    <div v-for="c in RING_CONTROLS" :key="c.key" class="param">
      <div class="param__head">
        <span class="param__text">
          <span class="param__name t-strong">{{ c.label }}</span>
          <span class="param__note t-label t-label--lc muted">{{ c.note }}</span>
        </span>
        <span class="param__value t-label t-label--lc">
          <template v-if="c.kind === 'time'">{{ ring.settings[c.key] }} ms</template>
          <button v-if="!ring.isDefault(c.key)" class="param__reset" type="button" @click="ring.resetOne(c.key)">reset</button>
        </span>
      </div>
      <input
        v-if="c.kind === 'time'"
        class="param__slider"
        type="range"
        :min="c.min" :max="c.max" :step="c.step"
        :value="ring.settings[c.key]"
        :aria-label="c.label"
        @input="ring.set(c.key, $event.target.value)"
      >
      <select v-else class="param__select" :value="ring.settings[c.key]" :aria-label="c.label" @change="ring.set(c.key, $event.target.value)">
        <option v-for="e in RING_EASINGS" :key="e.id" :value="e.id">{{ e.label }}</option>
      </select>
    </div>
    <template #footer><PanelActions :snapshot="ring.snapshot" @reset="ring.reset()" /></template>
  </FloatingPanel>
</template>

<style scoped>
.param { margin-bottom: 2.4rem; }
.param__head { display: flex; align-items: center; gap: 2rem; margin-bottom: 0.8rem; }
.param__text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.param__note { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.param__value { color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; text-align: right; }
.param__reset {
  margin-left: 1.2rem;
  color: var(--ink);
  text-decoration: underline;
  font: inherit;
}
.param__slider {
  display: block;
  width: 100%;
  height: 6.4rem;
  margin: 0;
  accent-color: var(--ink);
  touch-action: pan-y;
}
.param__select {
  width: 100%;
  height: 8.8rem;
  padding: 0 2rem;
  font: 600 var(--text-label)/1 var(--font-display);
  color: var(--ink);
  background: var(--white);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-sm);
}
</style>
