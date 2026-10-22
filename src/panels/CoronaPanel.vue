<script setup>
import FloatingPanel from '../components/FloatingPanel.vue';
import PanelActions from '../components/PanelActions.vue';
import { CORONA_CONTROLS, useCoronaStore } from '../stores/corona';

/** The Corona window: a slider per knob of the glow round the HUD's key count, live. */
const corona = useCoronaStore();
</script>

<template>
  <FloatingPanel id="corona" title="Corona">
    <div v-for="t in CORONA_CONTROLS" :key="t.key" class="param">
      <div class="param__head">
        <span class="param__text">
          <span class="param__name t-strong">{{ t.label }}</span>
          <span v-if="t.note" class="param__note t-label t-label--lc muted">{{ t.note }}</span>
        </span>
        <span class="param__value t-label t-label--lc">
          {{ corona.settings[t.key] }}
          <button v-if="!corona.isDefault(t.key)" class="param__reset" type="button" @click="corona.resetOne(t.key)">reset</button>
        </span>
      </div>
      <input
        class="param__slider"
        type="range"
        :min="t.min"
        :max="t.max"
        :step="t.step"
        :value="corona.settings[t.key]"
        :aria-label="t.label"
        @input="corona.set(t.key, $event.target.value)"
      >
    </div>
    <template #footer><PanelActions :snapshot="corona.snapshot" @reset="corona.reset()" /></template>
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
</style>
