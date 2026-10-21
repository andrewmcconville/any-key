import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';

const STORAGE_KEY = 'any-key/tokens/v1';

/**
 * The type ramp, in rem (1rem = 10 Figma canvas px). These mirror the defaults in styles.css;
 * `lh` is the line-height that goes with each size, and the ratio between the two is kept when a
 * size is changed. `sample` is the class that renders text in that style.
 */
export const TYPE_TOKENS = [
  { id: 'display', label: 'Display', size: 16,  lh: 16,   min: 8,   max: 32, sample: 't-display' },
  { id: 'title',   label: 'Title',   size: 9.6, lh: 10.4, min: 4,   max: 16, sample: 't-title' },
  { id: 'heading', label: 'Heading', size: 5.6, lh: 6.8,  min: 3,   max: 10, sample: 't-heading' },
  { id: 'body',    label: 'Body',    size: 5.2, lh: 6.8,  min: 3,   max: 10, sample: 't-body' },
  { id: 'label',   label: 'Label',   size: 4,   lh: 5,    min: 2.4, max: 8,  sample: 't-label' },
  { id: 'button',  label: 'Button',  size: 4.4, lh: 5.2,  min: 3,   max: 8,  sample: 't-button' },
];

const round = n => Math.round(n * 10) / 10;

export const useTokensStore = defineStore('tokens', () => {
  // Current size per token id, in rem
  const sizes = reactive(Object.fromEntries(TYPE_TOKENS.map(t => [t.id, t.size])));

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    for (const t of TYPE_TOKENS) {
      const v = Number(saved[t.id]);
      if (Number.isFinite(v) && v >= t.min && v <= t.max) sizes[t.id] = v;
    }
  } catch (_) { /* ignore */ }

  /** Write every token to the :root custom properties the stylesheet reads. */
  function apply() {
    const root = document.documentElement.style;
    for (const t of TYPE_TOKENS) {
      const size = sizes[t.id];
      root.setProperty(`--text-${t.id}`, `${size}rem`);
      root.setProperty(`--lh-${t.id}`, `${round(size * (t.lh / t.size))}rem`);
    }
  }

  function set(id, value) {
    const t = TYPE_TOKENS.find(x => x.id === id);
    if (!t) return;
    sizes[id] = round(Math.min(t.max, Math.max(t.min, Number(value))));
  }

  function reset() {
    for (const t of TYPE_TOKENS) sizes[t.id] = t.size;
  }

  const isDefault = id => sizes[id] === TYPE_TOKENS.find(t => t.id === id).size;

  watch(sizes, () => {
    apply();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sizes)); } catch (_) { /* ignore */ }
  }, { deep: true, immediate: true });

  return { sizes, set, reset, isDefault };
});
