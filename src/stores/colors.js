import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import { oklchCss, oklchToHex, round } from '../lib/oklch';

const STORAGE_KEY = 'any-key/colors/v2';

/**
 * The colour tokens in OKLCH, mirroring the defaults in styles.css. l is lightness 0–1, c chroma,
 * h hue in degrees; the scrim also carries an alpha. `note` says what the token paints.
 */
export const COLOR_TOKENS = [
  { id: 'ink',       label: 'Ink',       l: 0.269, c: 0,     h: 0,   note: 'text, strokes, filled keys' },
  { id: 'paper',     label: 'Paper',     l: 0.976, c: 0,     h: 0,   note: 'board background' },
  { id: 'white',     label: 'White',     l: 1,     c: 0,     h: 0,   note: 'panels, buttons, open keys' },
  { id: 'bar',       label: 'Bar',       l: 0.952, c: 0,     h: 0,   note: 'HUD bars' },
  { id: 'muted',     label: 'Muted',     l: 0.551, c: 0.023, h: 264, note: 'eyebrows, years, locked' },
  { id: 'line-soft', label: 'Line soft', l: 0.836, c: 0,     h: 0,   note: 'hairlines, card borders' },
  { id: 'fill-soft', label: 'Fill soft', l: 0.922, c: 0,     h: 0,   note: 'image placeholder' },
  { id: 'scrim',     label: 'Scrim',     l: 0.269, c: 0,     h: 0,   alpha: 0.72, note: 'behind modals' },
];

/** Slider ranges and steps for each channel. */
export const CHANNELS = [
  { key: 'l', label: 'L', min: 0, max: 1,   step: 0.005, dp: 3 },
  { key: 'c', label: 'C', min: 0, max: 0.4, step: 0.005, dp: 3 },
  { key: 'h', label: 'H', min: 0, max: 360, step: 1,     dp: 0 },
];

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const fresh = t => ({ l: t.l, c: t.c, h: t.h, alpha: t.alpha ?? 1 });

export const useColorsStore = defineStore('colors', () => {
  const values = reactive(Object.fromEntries(COLOR_TOKENS.map(t => [t.id, fresh(t)])));

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    for (const t of COLOR_TOKENS) {
      const v = saved[t.id];
      if (!v) continue;
      for (const ch of CHANNELS) {
        const n = Number(v[ch.key]);
        if (Number.isFinite(n)) values[t.id][ch.key] = clamp(n, ch.min, ch.max);
      }
      if (t.alpha != null && Number.isFinite(Number(v.alpha))) values[t.id].alpha = clamp(Number(v.alpha), 0, 1);
    }
  } catch (_) { /* ignore */ }

  const token = id => COLOR_TOKENS.find(x => x.id === id);
  /** CSS value for a token as the stylesheet expects it. */
  const css = id => oklchCss(values[id]);
  /** Nearest sRGB hex, for readouts and for pasting into tools that want hex. */
  const hex = id => oklchToHex(values[id]);

  function apply() {
    const root = document.documentElement.style;
    for (const t of COLOR_TOKENS) root.setProperty(`--${t.id}`, css(t.id));
  }

  function setChannel(id, key, value) {
    const ch = CHANNELS.find(x => x.key === key);
    if (values[id] && ch) values[id][key] = round(clamp(Number(value), ch.min, ch.max), ch.dp);
  }
  function setAlpha(id, alpha) {
    if (values[id]) values[id].alpha = round(clamp(Number(alpha), 0, 1), 2);
  }
  function resetOne(id) {
    const t = token(id);
    if (t) Object.assign(values[id], fresh(t));
  }
  function reset() { COLOR_TOKENS.forEach(t => resetOne(t.id)); }
  const isDefault = id => {
    const t = token(id), v = values[id];
    return v.l === t.l && v.c === t.c && v.h === t.h && v.alpha === (t.alpha ?? 1);
  };

  watch(values, () => {
    apply();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch (_) { /* ignore */ }
  }, { deep: true, immediate: true });

  return { values, css, hex, setChannel, setAlpha, resetOne, reset, isDefault };
});
