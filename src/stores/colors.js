import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';

const STORAGE_KEY = 'any-key/colors/v1';

/**
 * The colour tokens, mirroring the defaults in styles.css. `hex` is the value; the scrim also has
 * an `alpha` because it is painted as rgba. `note` says what the token is for in the panel.
 */
export const COLOR_TOKENS = [
  { id: 'ink',       label: 'Ink',       hex: '#262626', note: 'text, strokes, filled keys' },
  { id: 'paper',     label: 'Paper',     hex: '#f7f7f7', note: 'board background' },
  { id: 'white',     label: 'White',     hex: '#ffffff', note: 'panels, buttons, open keys' },
  { id: 'bar',       label: 'Bar',       hex: '#efefef', note: 'HUD bars' },
  { id: 'muted',     label: 'Muted',     hex: '#6b7280', note: 'eyebrows, years, locked' },
  { id: 'line-soft', label: 'Line soft', hex: '#c9c9c9', note: 'hairlines, card borders' },
  { id: 'fill-soft', label: 'Fill soft', hex: '#e5e5e5', note: 'image placeholder' },
  { id: 'scrim',     label: 'Scrim',     hex: '#262626', alpha: 0.72, note: 'behind modals' },
];

const HEX = /^#[0-9a-f]{6}$/i;

function rgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export const useColorsStore = defineStore('colors', () => {
  const values = reactive(Object.fromEntries(COLOR_TOKENS.map(t => [t.id, { hex: t.hex, alpha: t.alpha ?? 1 }])));

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    for (const t of COLOR_TOKENS) {
      const v = saved[t.id];
      if (v && HEX.test(v.hex)) values[t.id].hex = v.hex.toLowerCase();
      if (v && t.alpha != null && Number.isFinite(Number(v.alpha))) values[t.id].alpha = Math.min(1, Math.max(0, Number(v.alpha)));
    }
  } catch (_) { /* ignore */ }

  /** CSS value for a token as the stylesheet expects it. */
  const css = id => {
    const t = COLOR_TOKENS.find(x => x.id === id);
    return t.alpha != null ? rgba(values[id].hex, values[id].alpha) : values[id].hex;
  };

  function apply() {
    const root = document.documentElement.style;
    for (const t of COLOR_TOKENS) root.setProperty(`--${t.id}`, css(t.id));
  }

  function setHex(id, hex) {
    if (values[id] && HEX.test(hex)) values[id].hex = hex.toLowerCase();
  }
  function setAlpha(id, alpha) {
    if (values[id]) values[id].alpha = Math.round(Math.min(1, Math.max(0, Number(alpha))) * 100) / 100;
  }
  function resetOne(id) {
    const t = COLOR_TOKENS.find(x => x.id === id);
    if (t) { values[id].hex = t.hex; values[id].alpha = t.alpha ?? 1; }
  }
  function reset() { COLOR_TOKENS.forEach(t => resetOne(t.id)); }
  const isDefault = id => {
    const t = COLOR_TOKENS.find(x => x.id === id);
    return values[id].hex === t.hex && values[id].alpha === (t.alpha ?? 1);
  };

  watch(values, () => {
    apply();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch (_) { /* ignore */ }
  }, { deep: true, immediate: true });

  return { values, css, setHex, setAlpha, resetOne, reset, isDefault };
});
