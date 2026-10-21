<script setup>
import { computed, onUnmounted, ref, watch } from 'vue';
import FloatingPanel from '../components/FloatingPanel.vue';
import PanelActions from '../components/PanelActions.vue';
import { FAMILIES, bindingsFor, collectRules, nearestBound, unscoped } from '../lib/bindings';
import { elementsWithFontSize, flashElements } from '../lib/flash';
import { useRemPx } from '../composables/useRemPx';
import { useInspectStore } from '../stores/inspect';
import { usePanelsStore } from '../stores/panels';
import { CHANNELS, useColorsStore } from '../stores/colors';
import { SHAPE_TOKENS, useShapeStore } from '../stores/shape';
import { TYPE_TOKENS, useTokensStore } from '../stores/tokens';

const inspect = useInspectStore();
const panels = usePanelsStore();
const tokens = useTokensStore();
const colors = useColorsStore();
const shape = useShapeStore();
const { remPx } = useRemPx();

/* ---------- The picked element and its bindings ---------- */

const bindings = ref([]);
function refresh() {
  const el = inspect.selected;
  bindings.value = el && el.isConnected ? bindingsFor(el) : [];
}
// Recompute when the pick or the overrides change, and when any slider moves (the computed readouts follow).
watch(() => [inspect.selected, inspect.version], refresh, { immediate: true });
watch(() => JSON.stringify([tokens.sizes, colors.values, shape.values]), refresh);

const componentName = el => el?.__vueParentComponent?.type?.__name || el?.__vueParentComponent?.type?.name || null;
const describe = el => {
  if (!el) return '';
  const classes = [...el.classList].filter(c => !c.startsWith('inspect-') && !c.startsWith('token-flash')).slice(0, 3);
  return el.tagName.toLowerCase() + classes.map(c => `.${c}`).join('');
};
const name = computed(() => componentName(inspect.selected) ?? describe(inspect.selected));

// Keep a dashed outline on whatever is selected.
watch(() => inspect.selected, (el, prev) => {
  prev?.classList.remove('inspect-selected');
  el?.classList.add('inspect-selected');
});

/* ---------- Pick mode ---------- */

let rules = null;
let cache = null;
let hovered = null;
let picked = false;

const setHover = el => {
  if (hovered === el) return;
  hovered?.classList.remove('inspect-hover');
  hovered = el;
  hovered?.classList.add('inspect-hover');
};
// The bound element under the pointer; undefined when the pointer is over a panel (leave those alone).
function targetOf(e) {
  const t = e.target instanceof Element ? e.target : null;
  if (!t) return undefined;
  return nearestBound(t, rules, cache);
}
function onMove(e) {
  const el = targetOf(e);
  if (el !== undefined) setHover(el);
}
function onDown(e) {
  const el = targetOf(e);
  if (el === undefined) return;
  e.preventDefault(); e.stopPropagation();
  if (el) { inspect.select(el); picked = true; }
}
// The click that follows the pick is swallowed so the app does not act on it, then picking ends.
function onClick(e) {
  if (targetOf(e) === undefined) return;
  e.preventDefault(); e.stopPropagation();
  if (picked) stopPicking();
}
function onKey(e) {
  if (e.key !== 'Escape') return;
  e.stopPropagation();
  stopPicking();
}

const listeners = [['pointermove', onMove], ['pointerdown', onDown], ['click', onClick], ['keydown', onKey]];
function startPicking() {
  rules = collectRules();
  cache = new WeakMap();
  picked = false;
  inspect.picking = true;
  document.documentElement.classList.add('inspect-picking');
  listeners.forEach(([type, fn]) => document.addEventListener(type, fn, true));
}
function stopPicking() {
  inspect.picking = false;
  document.documentElement.classList.remove('inspect-picking');
  listeners.forEach(([type, fn]) => document.removeEventListener(type, fn, true));
  setHover(null);
  rules = cache = null;
}
const togglePicking = () => (inspect.picking ? stopPicking() : startPicking());

function clearSelection() { inspect.clear(); }

// Closing the panel ends the session: no stray outlines, no capture listeners.
watch(() => panels.isOpen('inspect'), open => { if (!open) { stopPicking(); inspect.clear(); } });
onUnmounted(() => { stopPicking(); inspect.clear(); });

/* ---------- Retune and rebind ---------- */

const typeToken = id => TYPE_TOKENS.find(t => t.id === id);
const shapeToken = id => SHAPE_TOKENS.find(t => t.id === id);
const fmt = (ch, v) => (ch.key === 'h' ? `${Math.round(v)}°` : v.toFixed(ch.dp));
// Chrome reports computed colours in oklch, so a colour token's readout is its nearest hex from the store.
const readout = b => (b.family === 'color' && b.tokenId ? colors.hex(b.tokenId) : b.computed);

// Grabbing a slider flashes the token's reach; grabbing a dropdown flashes the selector's reach.
const flashToken = b => flashElements(b.family === 'type'
  ? elementsWithFontSize(tokens.sizes[b.tokenId] * remPx.value)
  : document.querySelectorAll(b.selector));
const flashSelector = b => flashElements(document.querySelectorAll(b.selector));

function onRebind(b, e) {
  const id = e.target.value;
  if (id && id !== '__literal') inspect.rebind(b, id);
}
</script>

<template>
  <FloatingPanel id="inspect" title="Inspect" width="112rem">
    <button class="pick t-label" :class="{ 'pick--on': inspect.picking }" type="button" @click="togglePicking">
      {{ inspect.picking ? 'Picking · tap an element, Esc to stop' : 'Pick an element' }}
    </button>

    <p v-if="!inspect.selected" class="hint t-label t-label--lc muted">
      Pick, then tap anything on the page. Elements set with a token, or a literal where a token belongs, can be picked.
    </p>

    <template v-else>
      <div class="target">
        <span class="target__text">
          <span class="target__name t-strong">{{ name }}</span>
          <span class="target__desc t-label t-label--lc muted">{{ describe(inspect.selected) }}</span>
        </span>
        <button class="link t-label t-label--lc" type="button" @click="clearSelection">clear</button>
      </div>

      <p v-if="!bindings.length" class="hint t-label t-label--lc muted">This element is gone from the page.</p>

      <div v-for="b in bindings" :key="b.slot" class="binding">
        <div class="binding__head">
          <span class="binding__label t-label">{{ b.label }}</span>
          <select
            class="binding__select"
            :value="b.tokenId ?? '__literal'"
            :aria-label="`${b.label} token`"
            @pointerdown="flashSelector(b)"
            @change="onRebind(b, $event)"
          >
            <option v-if="!b.tokenId" value="__literal" disabled>{{ b.raw }} · no token</option>
            <option v-for="o in FAMILIES[b.family].options" :key="o.id" :value="o.id">{{ o.label }}</option>
          </select>
          <span class="binding__value t-label t-label--lc muted">{{ readout(b) }}</span>
        </div>
        <div class="binding__where t-label t-label--lc muted">
          {{ unscoped(b.selector) }}<template v-if="b.alias"> · via {{ b.alias }}</template>
        </div>

        <template v-if="b.tokenId">
          <input
            v-if="b.family === 'type'"
            class="slider"
            type="range"
            :min="typeToken(b.tokenId).min" :max="typeToken(b.tokenId).max" step="0.1"
            :value="tokens.sizes[b.tokenId]"
            :aria-label="`${typeToken(b.tokenId).label} size`"
            @pointerdown="flashToken(b)"
            @input="tokens.set(b.tokenId, $event.target.value)"
          >
          <input
            v-else-if="b.family === 'radius' || b.family === 'border'"
            class="slider"
            type="range"
            :min="shapeToken(b.tokenId).min" :max="shapeToken(b.tokenId).max" :step="shapeToken(b.tokenId).step"
            :value="shape.values[b.tokenId]"
            :aria-label="`${shapeToken(b.tokenId).label} value`"
            @pointerdown="flashToken(b)"
            @input="shape.set(b.tokenId, $event.target.value)"
          >
          <template v-else>
            <label v-for="ch in CHANNELS" :key="ch.key" class="channel">
              <span class="channel__key t-label">{{ ch.label }}</span>
              <input
                class="channel__slider"
                type="range"
                :min="ch.min" :max="ch.max" :step="ch.step"
                :value="colors.values[b.tokenId][ch.key]"
                :aria-label="`${b.tokenId} ${ch.label}`"
                @pointerdown="flashToken(b)"
                @input="colors.setChannel(b.tokenId, ch.key, $event.target.value)"
              >
              <span class="channel__value t-label t-label--lc">{{ fmt(ch, colors.values[b.tokenId][ch.key]) }}</span>
            </label>
          </template>
        </template>
      </div>
    </template>

    <PanelActions :snapshot="inspect.snapshot" @reset="inspect.reset()" />
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
.target__text { display: flex; flex-direction: column; min-width: 0; }
.target__desc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.link { color: var(--ink); text-decoration: underline; flex: 0 0 auto; }
.binding { margin-bottom: 2.8rem; }
.binding__head { display: flex; align-items: center; gap: 2rem; }
.binding__label { flex: 0 0 22rem; color: var(--muted); }
.binding__select {
  flex: 1 1 auto; min-width: 0;
  height: 8.8rem;
  padding: 0 2rem;
  font: 600 var(--text-label)/1 var(--font-display);
  color: var(--ink);
  background: var(--white);
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-sm);
}
.binding__value { flex: 0 0 auto; white-space: nowrap; font-variant-numeric: tabular-nums; }
.binding__where { margin: 0.6rem 0 0.4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
