<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import FloatingPanel from '../components/FloatingPanel.vue';
import PanelActions from '../components/PanelActions.vue';
import TokenTuner from '../components/TokenTuner.vue';
import { FAMILIES, resolve } from '../lib/bindings';
import { elementsWithFontSize, flashElements } from '../lib/flash';
import { useRemPx } from '../composables/useRemPx';
import { useInspectStore } from '../stores/inspect';
import { useColorsStore } from '../stores/colors';
import { useMotionStore } from '../stores/motion';
import { useShapeStore } from '../stores/shape';
import { useTokensStore } from '../stores/tokens';

const inspect = useInspectStore();
const tokens = useTokensStore();
const colors = useColorsStore();
const shape = useShapeStore();
const motion = useMotionStore();
const { remPx, px } = useRemPx();

/* ---------- The picked element: its token bindings and its knobs ---------- */

const bindings = ref([]);
const knobs = ref([]);
function refresh() {
  const el = inspect.selected;
  const r = el && el.isConnected ? resolve(el) : { bindings: [], knobs: [] };
  bindings.value = r.bindings;
  knobs.value = r.knobs;
}
// Recompute when the pick or the overrides change, and when any slider moves (the readouts follow).
watch(() => [inspect.selected, inspect.version], refresh, { immediate: true });
watch(() => JSON.stringify([tokens.sizes, colors.values, shape.values, motion.durations, motion.easings]), refresh);
onUnmounted(() => { inspect.stopPicking(); inspect.clear(); });

// The component that rendered the element (dev builds), else its tag.
const name = computed(() => {
  const el = inspect.selected;
  return el?.__vueParentComponent?.type?.__name || el?.__vueParentComponent?.type?.name || el?.tagName.toLowerCase() || '';
});
const gone = computed(() => inspect.selected && !bindings.value.length && !knobs.value.length);

/* ---------- Replay ---------- */

// A component that can run its motion on demand marks that element with data-replay and listens
// for the motion-replay event (see EraDots). Play asks the picked element, or its nearest such parent.
const replayTarget = computed(() => inspect.selected?.closest('[data-replay]') ?? null);
function replay() { replayTarget.value?.dispatchEvent(new CustomEvent('motion-replay')); }

/* ---------- Rows: bindings first, then knobs ---------- */

const reachOf = row => (row.family === 'type' && row.tokenId
  ? elementsWithFontSize(tokens.sizes[row.tokenId] * remPx.value)
  : document.querySelectorAll(row.selector));
const flashSelector = row => flashElements(document.querySelectorAll(row.selector));

// What a row is currently worth, in the unit a designer reads.
function readout(row) {
  if (row.kind === 'time') return `${Math.round(row.num * 1000)}ms`;
  if (row.kind === 'length') return `${row.num}${row.unit} · ${px(row.unit === 'rem' ? row.num : row.num / remPx.value)}px`;
  if (row.kind === 'number') return String(row.num);
  if (row.tokenId) {
    switch (row.family) {
      case 'color': return colors.hex(row.tokenId);
      case 'duration': return `${motion.ms(row.tokenId)}ms`;
      case 'easing': return motion.easingCss(row.tokenId).replace('cubic-bezier', '');
      case 'type': return `${px(tokens.sizes[row.tokenId])}px`;
      case 'radius': case 'border': return `${px(shape.values[row.tokenId])}px`;
    }
  }
  return row.computed ?? row.raw;
}

function onRebind(row, e) {
  const id = e.target.value;
  if (id && id !== '__literal') inspect.rebind(row, id);
}
// Numeric knobs: slider bounds from the current value, written back as a literal in the knob's unit.
const knobRange = k => {
  if (k.kind === 'time') return { min: 0, max: 1, step: 0.01 };
  const max = Math.max(1, Math.ceil(Math.abs(k.num) * 4));
  return { min: 0, max, step: max > 2 ? 0.1 : 0.01 };
};
function onKnob(k, e) {
  const v = Number(e.target.value);
  inspect.setKnob(k, k.kind === 'time' ? `${v}s` : k.kind === 'length' ? `${v}${k.unit}` : String(v));
}

/* ---------- Reset all ---------- */

// The sliders in the rows retune global tokens, not the element, so Reset all puts back both: the
// rebinds and knob values, and every token the rows show, before and after the rebinds are undone
// (undoing a rebind brings the original token back into view, and it may have been tuned too).
const STORE_OF = { type: tokens, color: colors, radius: shape, border: shape, duration: motion, easing: motion };
function resetShownTokens() {
  for (const row of [...bindings.value, ...knobs.value]) {
    if (row.tokenId) STORE_OF[row.family]?.resetOne(row.tokenId);
  }
}
function resetAll() {
  resetShownTokens();
  inspect.reset();
  refresh();
  resetShownTokens();
}
</script>

<template>
  <FloatingPanel id="inspect" title="Inspect" width="112rem">
    <button class="pick t-label" :class="{ 'pick--on': inspect.picking }" type="button" @click="inspect.togglePicking()">
      {{ inspect.picking ? 'Picking · tap an element, Esc to stop' : 'Pick an element' }}
    </button>

    <p v-if="!inspect.selected" class="hint t-label t-label--lc muted">
      Pick, then tap anything on the page. Elements set with a token, or a literal where a token belongs, can be picked.
    </p>

    <template v-else>
      <div class="target">
        <span class="target__name t-strong">{{ name }}</span>
        <span class="target__actions">
          <button v-if="replayTarget" class="play t-label" type="button" @click="replay">Play</button>
          <button class="link t-label t-label--lc" type="button" @click="inspect.clear()">clear</button>
        </span>
      </div>

      <p v-if="gone" class="hint t-label t-label--lc muted">This element is gone from the page.</p>

      <div v-for="b in bindings" :key="b.slot" class="row">
        <div class="row__head">
          <span class="row__label t-label">{{ b.label }}</span>
          <select
            class="row__select"
            :value="b.tokenId ?? '__literal'"
            :aria-label="`${b.label} token`"
            @pointerdown="flashSelector(b)"
            @change="onRebind(b, $event)"
          >
            <option v-if="!b.tokenId" value="__literal" disabled>{{ b.raw }} · no token</option>
            <option v-for="o in FAMILIES[b.family].options" :key="o.id" :value="o.id">{{ o.label }}</option>
          </select>
          <span class="row__value t-label t-label--lc muted">{{ readout(b) }}</span>
        </div>
        <TokenTuner v-if="b.tokenId" :family="b.family" :token-id="b.tokenId" :reach="() => reachOf(b)" />
      </div>

      <template v-if="knobs.length">
        <h3 class="knobs__title t-label muted">Knobs</h3>
        <div v-for="k in knobs" :key="k.prop" class="row">
          <div class="row__head">
            <span class="row__label t-label">{{ k.label }}</span>
            <select
              v-if="k.kind === 'token'"
              class="row__select"
              :value="k.tokenId"
              :aria-label="`${k.label} token`"
              @pointerdown="flashSelector(k)"
              @change="onRebind(k, $event)"
            >
              <option v-for="o in FAMILIES[k.family].options" :key="o.id" :value="o.id">{{ o.label }}</option>
            </select>
            <input
              v-else
              class="row__slider"
              type="range"
              :min="knobRange(k).min" :max="knobRange(k).max" :step="knobRange(k).step"
              :value="k.num"
              :aria-label="k.label"
              @pointerdown="flashSelector(k)"
              @input="onKnob(k, $event)"
            >
            <span class="row__value t-label t-label--lc muted">{{ readout(k) }}</span>
          </div>
          <TokenTuner v-if="k.kind === 'token'" :family="k.family" :token-id="k.tokenId" :reach="() => reachOf(k)" />
        </div>
      </template>
    </template>

    <template #footer><PanelActions :snapshot="inspect.snapshot" @reset="resetAll" /></template>
  </FloatingPanel>
</template>

<style scoped>
.pick {
  width: 100%;
  height: 11.2rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-sm);
  background: var(--white);
  margin-bottom: 2.4rem;
}
.pick--on { background: var(--ink); color: var(--white); }
.hint { margin: 0 0 2.4rem; }
.target {
  display: flex; align-items: center; justify-content: space-between; gap: 2.4rem;
  padding-bottom: 2rem; margin-bottom: 2rem;
  border-bottom: var(--hairline) solid var(--line-soft);
}
.target__actions { display: flex; align-items: center; gap: 2.4rem; flex: 0 0 auto; }
.play {
  height: 7.2rem; padding: 0 2.4rem;
  border: var(--stroke) solid var(--ink); border-radius: var(--radius-sm);
  background: var(--ink); color: var(--white);
}
.link { color: var(--ink); text-decoration: underline; }
.knobs__title { margin: 3.2rem 0 1.6rem; }
.row { margin-bottom: 2.4rem; }
.row__head { display: flex; align-items: center; gap: 2rem; margin-bottom: 0.8rem; }
.row__label { flex: 0 0 22rem; color: var(--muted); text-transform: uppercase; }
.row__select {
  flex: 1 1 auto; min-width: 0;
  height: 8.8rem;
  padding: 0 2rem;
  font: 600 var(--text-label)/1 var(--font-display);
  color: var(--ink);
  background: var(--white);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-sm);
}
.row__slider { flex: 1 1 auto; min-width: 0; height: 6.4rem; margin: 0; accent-color: var(--ink); touch-action: pan-y; }
.row__value { flex: 0 0 auto; white-space: nowrap; font-variant-numeric: tabular-nums; }
</style>
