<script setup>
import FloatingPanel from '../components/FloatingPanel.vue';
import PanelActions from '../components/PanelActions.vue';
import { KEYS } from '../data/content';
import { RODS, SWING_CONTROLS, useSwingStore } from '../stores/swing';

/**
 * The Scroll physics window: a slider per knob of the keys' swing, live, over a trace of every
 * key's lag as the board scrolls; the title bar's play flicks every key from full lag.
 */
const swing = useSwingStore();
const readout = c => `${swing.settings[c.key]}${c.unit === '×' ? c.unit : c.unit ? ` ${c.unit}` : ''}`;
// The trace: one row per key, the rail its centre line, the key a dot that trails left or right.
const rows = KEYS.map(k => ({ id: k.id, name: k.name, length: RODS.find(r => r.id === k.id).length }));
const dotStyle = id => ({ left: `${50 + 50 * swing.lags[id] / Math.max(1, swing.settings.maxLag)}%` });
</script>

<template>
  <FloatingPanel id="swing" title="Scroll physics" :play="swing.play">
    <div class="trace" aria-hidden="true">
      <div class="trace__rail" />
      <div v-for="r in rows" :key="r.id" class="trace__row">
        <span class="trace__name t-label t-label--lc">{{ r.name }}</span>
        <span class="trace__track"><span class="trace__dot" :style="dotStyle(r.id)" /></span>
        <span class="trace__len t-label t-label--lc">{{ r.length }}</span>
      </div>
      <p class="trace__note t-label t-label--lc muted">lag, −max to +max · chain length, px</p>
    </div>

    <div v-for="c in SWING_CONTROLS" :key="c.key" class="param">
      <div class="param__head">
        <span class="param__text">
          <span class="param__name t-strong">{{ c.label }}</span>
          <span v-if="c.note" class="param__note t-label t-label--lc muted">{{ c.note }}</span>
        </span>
        <span class="param__value t-label t-label--lc">
          {{ readout(c) }}
          <button v-if="!swing.isDefault(c.key)" class="param__reset" type="button" @click="swing.resetOne(c.key)">reset</button>
        </span>
      </div>
      <input
        class="param__slider"
        type="range"
        :min="c.min"
        :max="c.max"
        :step="c.step"
        :value="swing.settings[c.key]"
        :aria-label="c.label"
        @input="swing.set(c.key, $event.target.value)"
      >
    </div>
    <template #footer><PanelActions :snapshot="swing.snapshot" @reset="swing.reset()" /></template>
  </FloatingPanel>
</template>

<style scoped>
.trace { position: relative; margin-bottom: 3.2rem; }
.trace__row { display: grid; grid-template-columns: 1fr 50% 6rem; align-items: center; gap: 1.2rem; height: 4.4rem; line-height: 1; }
.trace__name { color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.trace__len { color: var(--muted); text-align: right; font-variant-numeric: tabular-nums; }
.trace__track { position: relative; height: 100%; }
/* The rail: one line down the middle of every track, the keys' rest position. */
.trace__track::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; border-left: 0.2rem solid var(--muted); opacity: .5; }
.trace__dot {
  position: absolute; top: 50%;
  width: 1.6rem; height: 1.6rem; margin: -0.8rem 0 0 -0.8rem;
  border-radius: 50%; background: var(--ink);
}
.trace__note { margin-top: 0.8rem; text-align: right; }

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
