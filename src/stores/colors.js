import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import { oklchCss, oklchToHex, round } from '../lib/oklch';

const STORAGE_KEY = 'any-key/colors/v2';

/**
 * The colour tokens. The values live in styles.css (the oklch() custom properties on :root) and
 * are read from there at boot, so the stylesheet is the single source of truth; `fallback` is only
 * used if the stylesheet cannot be read. `hasAlpha` marks the scrim, which is painted as oklch(… / a).
 * `note` says what the token paints.
 */
export const COLOR_TOKENS = [
  { id: 'ink',       label: 'Ink',       note: 'text, strokes, filled keys', fallback: { l: 0.269, c: 0, h: 0 } },
  { id: 'paper',     label: 'Paper',     note: 'board background',          fallback: { l: 0.976, c: 0, h: 0 } },
  { id: 'white',     label: 'White',     note: 'panels, buttons, open keys', fallback: { l: 1, c: 0, h: 0 } },
  { id: 'bar',       label: 'Bar',       note: 'HUD bars',                  fallback: { l: 0.952, c: 0, h: 0 } },
  { id: 'muted',     label: 'Muted',     note: 'eyebrows, years, locked',   fallback: { l: 0.551, c: 0.023, h: 264 } },
  { id: 'line-soft', label: 'Line soft', note: 'hairlines, card borders',   fallback: { l: 0.836, c: 0, h: 0 } },
  { id: 'fill-soft', label: 'Fill soft', note: 'image placeholder',         fallback: { l: 0.922, c: 0, h: 0 } },
  { id: 'scrim',     label: 'Scrim',     note: 'behind modals', hasAlpha: true, fallback: { l: 0.269, c: 0, h: 0, alpha: 0.72 } },
];

const OKLCH = /^\s*oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+)(%?))?\s*\)\s*$/i;

/** Parse "oklch(L C H)" / "oklch(L C H / A)" as the stylesheet writes it. */
function parseOklch(text) {
  const m = OKLCH.exec(text || '');
  if (!m) return null;
  let l = Number(m[1]); if (/%/.test(m[0].split('(')[1].split(/\s/)[0])) l /= 100;
  const alpha = m[4] == null ? 1 : (m[5] ? Number(m[4]) / 100 : Number(m[4]));
  return { l, c: Number(m[2]), h: Number(m[3]), alpha };
}

/** The stylesheet's defaults, read before any override is applied. */
function readDefaults() {
  const cs = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  return Object.fromEntries(COLOR_TOKENS.map(t => {
    const parsed = cs ? parseOklch(cs.getPropertyValue(`--${t.id}`)) : null;
    const d = parsed ?? { ...t.fallback, alpha: t.fallback.alpha ?? 1 };
    return [t.id, { l: d.l, c: d.c, h: d.h, alpha: t.hasAlpha ? d.alpha : 1 }];
  }));
}

/** Slider ranges and steps for each channel. */
export const CHANNELS = [
  { key: 'l', label: 'L', min: 0, max: 1,   step: 0.005, dp: 3 },
  { key: 'c', label: 'C', min: 0, max: 0.4, step: 0.005, dp: 3 },
  { key: 'h', label: 'H', min: 0, max: 360, step: 1,     dp: 0 },
];

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export const useColorsStore = defineStore('colors', () => {
  const defaults = readDefaults();
  const fresh = id => ({ ...defaults[id] });
  const values = reactive(Object.fromEntries(COLOR_TOKENS.map(t => [t.id, fresh(t.id)])));

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    for (const t of COLOR_TOKENS) {
      const v = saved[t.id];
      if (!v) continue;
      for (const ch of CHANNELS) {
        const n = Number(v[ch.key]);
        if (Number.isFinite(n)) values[t.id][ch.key] = clamp(n, ch.min, ch.max);
      }
      if (t.hasAlpha && Number.isFinite(Number(v.alpha))) values[t.id].alpha = clamp(Number(v.alpha), 0, 1);
    }
  } catch (_) { /* ignore */ }

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
    if (defaults[id]) Object.assign(values[id], fresh(id));
  }
  function reset() { COLOR_TOKENS.forEach(t => resetOne(t.id)); }
  const isDefault = id => {
    const d = defaults[id], v = values[id];
    return v.l === d.l && v.c === d.c && v.h === d.h && v.alpha === d.alpha;
  };

  watch(values, () => {
    apply();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch (_) { /* ignore */ }
  }, { deep: true, immediate: true });

  return { values, defaults, css, hex, setChannel, setAlpha, resetOne, reset, isDefault };
});
