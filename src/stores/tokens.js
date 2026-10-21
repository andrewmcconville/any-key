import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';

const STORAGE_KEY = 'any-key/tokens/v1';

/**
 * The type ramp. The sizes themselves live in styles.css (the --text-… and --lh-… custom properties
 * on :root) and are read from there at boot, so the stylesheet is the single source of truth;
 * `fallback` is only used if the stylesheet cannot be read. `sample` is the class that renders
 * text in that style; min/max bound the panel's slider, in rem (1rem = 10 Figma canvas px).
 */
export const TYPE_TOKENS = [
  { id: 'display', label: 'Display', min: 8,   max: 32, sample: 't-display', fallback: { size: 16,  lh: 16 } },
  { id: 'title',   label: 'Title',   min: 4,   max: 16, sample: 't-title',   fallback: { size: 9.6, lh: 10.4 } },
  { id: 'heading', label: 'Heading', min: 3,   max: 10, sample: 't-heading', fallback: { size: 5.6, lh: 6.8 } },
  { id: 'body',    label: 'Body',    min: 3,   max: 10, sample: 't-body',    fallback: { size: 5.2, lh: 6.8 } },
  { id: 'label',   label: 'Label',   min: 2.4, max: 8,  sample: 't-label',   fallback: { size: 4,   lh: 5 } },
  { id: 'button',  label: 'Button',  min: 3,   max: 8,  sample: 't-button',  fallback: { size: 4.4, lh: 5.2 } },
];

const round = n => Math.round(n * 10) / 10;

/** The stylesheet's defaults, read before any override is applied. */
function readDefaults() {
  const cs = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  return Object.fromEntries(TYPE_TOKENS.map(t => {
    const size = cs ? parseFloat(cs.getPropertyValue(`--text-${t.id}`)) : NaN;
    const lh = cs ? parseFloat(cs.getPropertyValue(`--lh-${t.id}`)) : NaN;
    return [t.id, Number.isFinite(size) && Number.isFinite(lh) ? { size, lh } : t.fallback];
  }));
}

export const useTokensStore = defineStore('tokens', () => {
  const defaults = readDefaults();
  // Current size per token id, in rem
  const sizes = reactive(Object.fromEntries(TYPE_TOKENS.map(t => [t.id, defaults[t.id].size])));

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    for (const t of TYPE_TOKENS) {
      const v = Number(saved[t.id]);
      if (Number.isFinite(v) && v >= t.min && v <= t.max) sizes[t.id] = v;
    }
  } catch (_) { /* ignore */ }

  /** Line-height for a token at its current size: the stylesheet's ratio is kept. */
  const lineHeight = id => round(sizes[id] * (defaults[id].lh / defaults[id].size));

  /** Write every token to the :root custom properties the stylesheet reads. */
  function apply() {
    const root = document.documentElement.style;
    for (const t of TYPE_TOKENS) {
      root.setProperty(`--text-${t.id}`, `${sizes[t.id]}rem`);
      root.setProperty(`--lh-${t.id}`, `${lineHeight(t.id)}rem`);
    }
  }

  function set(id, value) {
    const t = TYPE_TOKENS.find(x => x.id === id);
    if (!t) return;
    sizes[id] = round(Math.min(t.max, Math.max(t.min, Number(value))));
  }

  const resetOne = id => { if (defaults[id]) sizes[id] = defaults[id].size; };
  function reset() { TYPE_TOKENS.forEach(t => resetOne(t.id)); }
  const isDefault = id => sizes[id] === defaults[id].size;

  watch(sizes, () => {
    apply();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes)); } catch (_) { /* ignore */ }
  }, { deep: true, immediate: true });

  return { sizes, defaults, lineHeight, set, resetOne, reset, isDefault };
});
