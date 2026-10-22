<script setup>
import FloatingPanel from '../components/FloatingPanel.vue';
import PanelActions from '../components/PanelActions.vue';
import { FLIGHT_CONTROLS, useFlightStore } from '../stores/flight';

/** The Collect window: a slider per knob of the collect effect, live; the title bar's play runs it on demand. */
const flight = useFlightStore();
const readout = c => `${flight.settings[c.key]}${c.unit === '×' || c.unit === '°' ? c.unit : c.unit ? ` ${c.unit}` : ''}`;
</script>

<template>
  <FloatingPanel id="flight" title="Collect" :play="flight.play">
    <div v-for="c in FLIGHT_CONTROLS" :key="c.key" class="param">
      <div class="param__head">
        <span class="param__text">
          <span class="param__name t-strong">{{ c.label }}</span>
          <span v-if="c.note" class="param__note t-label t-label--lc muted">{{ c.note }}</span>
        </span>
        <span class="param__value t-label t-label--lc">
          {{ readout(c) }}
          <button v-if="!flight.isDefault(c.key)" class="param__reset" type="button" @click="flight.resetOne(c.key)">reset</button>
        </span>
      </div>
      <input
        class="param__slider"
        type="range"
        :min="c.min"
        :max="c.max"
        :step="c.step"
        :value="flight.settings[c.key]"
        :aria-label="c.label"
        @input="flight.set(c.key, $event.target.value)"
      >
    </div>
    <template #footer><PanelActions :snapshot="flight.snapshot" @reset="flight.reset()" /></template>
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
