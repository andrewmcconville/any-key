import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import { useUndoStore } from './undo';

/**
 * Border widths and corner radii. The values live in styles.css (custom properties on :root) and
 * are read from there at boot, so the stylesheet is the single source of truth; `fallback` is only
 * used if the stylesheet cannot be read. `note` says what the token shapes; min/max/step bound the
 * panel's slider, in rem (1rem = 10 Figma canvas px). --radius is an alias of --radius-md in the
 * stylesheet, so it follows the md slider on its own.
 *
 * Like the other design tools, overrides are not persisted: a refresh returns to the stylesheet.
 */
export const SHAPE_TOKENS = [
  { group: 'border', id: 'stroke',    label: 'Stroke',   note: 'buttons, era dots, controls',    min: 0, max: 1.2, step: 0.05, fallback: 0.4 },
  { group: 'border', id: 'hairline',  label: 'Hairline', note: 'HUD bars, modal frame, dividers', min: 0, max: 1.2, step: 0.05, fallback: 0.2 },
  { group: 'radius', id: 'radius-xs', label: 'XS',       note: 'images inside cards',             min: 0, max: 12,  step: 0.4, fallback: 1.2 },
  { group: 'radius', id: 'radius-sm', label: 'SM',       note: 'panel rows, action groups',       min: 0, max: 12,  step: 0.4, fallback: 1.6 },
  { group: 'radius', id: 'radius-md', label: 'MD',       note: 'HUD bars, panels, cards, buttons', min: 0, max: 12,  step: 0.4, fallback: 2.4 },
  { group: 'radius', id: 'radius-lg', label: 'LG',       note: 'toast',                           min: 0, max: 12,  step: 0.4, fallback: 3.2 },
  { group: 'radius', id: 'radius-xl', label: 'XL',       note: 'modal sheet',                     min: 0, max: 12,  step: 0.4, fallback: 4.8 },
];

export const SHAPE_GROUPS = [
  { key: 'border', label: 'Borders' },
  { key: 'radius', label: 'Radii' },
];

// Round to the token's own step precision: borders go in 0.05rem steps, radii in 0.4rem.
const decimals = t => (String(t.step).split('.')[1] || '').length;
const round = (n, t) => Number(n.toFixed(decimals(t)));

/** The stylesheet's defaults, read before any override is applied. */
function readDefaults() {
  const cs = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  return Object.fromEntries(SHAPE_TOKENS.map(t => {
    const v = cs ? parseFloat(cs.getPropertyValue(`--${t.id}`)) : NaN;
    return [t.id, Number.isFinite(v) ? v : t.fallback];
  }));
}

export const useShapeStore = defineStore('shape', () => {
  const defaults = readDefaults();
  // Current value per token id, in rem
  const values = reactive(Object.fromEntries(SHAPE_TOKENS.map(t => [t.id, defaults[t.id]])));

  /** Write every token to the :root custom properties the stylesheet reads. */
  function apply() {
    const root = document.documentElement.style;
    for (const t of SHAPE_TOKENS) root.setProperty(`--${t.id}`, `${values[t.id]}rem`);
  }

  function set(id, value) {
    const t = SHAPE_TOKENS.find(x => x.id === id);
    if (!t) return;
    values[id] = round(Math.min(t.max, Math.max(t.min, Number(value))), t);
  }

  const resetOne = id => { if (id in defaults) values[id] = defaults[id]; };
  function reset() { SHAPE_TOKENS.forEach(t => resetOne(t.id)); }
  const isDefault = id => values[id] === defaults[id];

  watch(values, apply, { deep: true, immediate: true });

  useUndoStore().track('shape', values);   // ⌘Z (stores/undo.js)

  return { values, defaults, set, resetOne, reset, isDefault };
});
