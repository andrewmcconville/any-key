import { defineStore } from 'pinia';
import { computed, reactive, ref, shallowRef } from 'vue';
import { OVERRIDE_SHEET_ID, rebound, unscoped } from '../lib/bindings';

/**
 * The Inspect tool: pick mode, the picked element, and the rebinds made from it. A rebind is a rule
 * written against the original selector into a tool-owned <style>, so it reaches the same elements
 * the stylesheet does and survives re-renders. Like the other design tools nothing persists: a
 * refresh returns to the stylesheet, and Copy values is how a decision leaves the browser.
 */
export const useInspectStore = defineStore('inspect', () => {
  const picking = ref(false);
  const selected = shallowRef(null);     // the picked element
  const overrides = reactive({});        // `${selector}::${prop}` → { selector, prop, value, extra }
  const version = ref(0);                // bumps on every override change so views recompute bindings

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

  function rebind(binding, newId) {
    const r = rebound(binding, newId);
    overrides[`${binding.selector}::${r.prop}`] = { selector: binding.selector, ...r };
    apply();
  }

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

  function select(el) { selected.value = el; }
  function clear() { selected.value = null; }

  return { picking, selected, overrides, version, hasOverrides, rebind, reset, snapshot, select, clear };
});
