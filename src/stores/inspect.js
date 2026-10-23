import { defineStore } from 'pinia';
import { computed, reactive, ref, shallowRef, watch } from 'vue';
import { OVERRIDE_SHEET_ID, collectRules, nearestBound, rebound, unscoped } from '../lib/bindings';
import { usePanelsStore } from './panels';
import { useUndoStore } from './undo';

/**
 * The Inspect tool: pick mode, the picked element, and the rebinds made from it. Pick mode lives
 * here rather than in the panel so any window's header button can start it. A rebind is a rule
 * written against the original selector into a tool-owned <style>, so it reaches the same elements
 * the stylesheet does and survives re-renders. Like the other design tools nothing persists: a
 * refresh returns to the stylesheet, and Copy values is how a decision leaves the browser.
 */
export const useInspectStore = defineStore('inspect', () => {
  const panels = usePanelsStore();
  const picking = ref(false);
  const selected = shallowRef(null);     // the picked element
  const overrides = reactive({});        // `${selector}::${prop}` → { selector, prop, value, extra }
  const version = ref(0);                // bumps on every override change so views recompute bindings

  /* ---------- Selection ---------- */

  function select(el) { selected.value = el; }
  function clear() { selected.value = null; }
  // Keep a dashed outline on whatever is selected.
  watch(selected, (el, prev) => {
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
    if (el) { select(el); picked = true; }
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

  /** Enter pick mode, opening the Inspect window if it is closed so the pick has somewhere to land. */
  function startPicking() {
    if (picking.value) return;
    if (!panels.isOpen('inspect')) panels.open('inspect', { x: 72, y: 264 });
    rules = collectRules();
    cache = new WeakMap();
    picked = false;
    picking.value = true;
    document.documentElement.classList.add('inspect-picking');
    listeners.forEach(([type, fn]) => document.addEventListener(type, fn, true));
  }
  function stopPicking() {
    if (!picking.value) return;
    picking.value = false;
    document.documentElement.classList.remove('inspect-picking');
    listeners.forEach(([type, fn]) => document.removeEventListener(type, fn, true));
    setHover(null);
    rules = cache = null;
  }
  const togglePicking = () => (picking.value ? stopPicking() : startPicking());

  // Closing the Inspect window ends the session: no stray outlines, no capture listeners.
  watch(() => panels.isOpen('inspect'), open => { if (!open) { stopPicking(); clear(); } });

  /* ---------- Overrides ---------- */

  function sheet() {
    let s = document.getElementById(OVERRIDE_SHEET_ID);
    if (!s) { s = document.createElement('style'); s.id = OVERRIDE_SHEET_ID; document.head.append(s); }
    return s;
  }
  const ruleText = o => `${o.selector} { ${[o, ...o.extra].map(d => `${d.prop}: ${d.value} !important;`).join(' ')} }`;
  function apply() {
    sheet().textContent = Object.values(overrides).map(ruleText).join('\n');
    version.value++;
  }
  /** Write one declaration against a selector (with any companions in `extra`). */
  function override(selector, prop, value, extra = []) {
    overrides[`${selector}::${prop}`] = { selector, prop, value, extra };
    apply();
  }
  /** Point a binding, or a token-valued knob, at another token of its family. */
  function rebind(binding, newId) {
    const r = rebound(binding, newId);
    override(binding.selector, r.prop, r.value, r.extra);
  }
  /** Give a numeric knob a new literal value, e.g. "0.12s" or "2.4rem". */
  function setKnob(knob, value) { override(knob.selector, knob.prop, value); }
  function reset() {
    for (const k of Object.keys(overrides)) delete overrides[k];
    apply();
  }
  const hasOverrides = computed(() => Object.keys(overrides).length > 0);

  /** The rebinds as they belong in the components' scoped styles. */
  function snapshot() {
    const lines = Object.values(overrides).map(o =>
      `${unscoped(o.selector)} { ${[o, ...o.extra].map(d => `${d.prop}: ${d.value};`).join(' ')} }`);
    return ['/* Any Key inspector rebinds — paste into the components\' <style scoped> */', ...(lines.length ? lines : ['/* none */'])].join('\n');
  }

  useUndoStore().track('inspect', overrides, apply);   // ⌘Z takes a rebind back; the sheet is rewritten by hand (stores/undo.js)

  return {
    picking, selected, overrides, version, hasOverrides,
    select, clear, startPicking, stopPicking, togglePicking,
    override, rebind, setKnob, reset, snapshot,
  };
});
