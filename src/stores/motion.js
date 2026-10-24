import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import { useUndoStore } from './undo';

/**
 * Motion tokens: durations (seconds) and easings (cubic-bezier control points). The values live in
 * styles.css (custom properties on :root) and are read from there at boot, so the stylesheet is the
 * single source of truth; `fallback` is only used if it cannot be read. `note` says what each one
 * times. Like the other design tools, overrides are not persisted: a refresh returns to the stylesheet.
 */
export const DURATION_TOKENS = [
  { id: 'dur-xs', label: 'XS', note: 'press feedback',                       fallback: 0.1 },
  { id: 'dur-sm', label: 'SM', note: 'state colours, overlays',              fallback: 0.2 },
  { id: 'dur-md', label: 'MD', note: 'toast, counter pop, board, era ring',  fallback: 0.3 },
  { id: 'dur-lg', label: 'LG', note: 'locked-key shake',                     fallback: 0.4 },
];
export const DURATION_RANGE = { min: 0, max: 1, step: 0.05 };

export const EASING_TOKENS = [
  { id: 'ease-standard',   label: 'Standard',   note: 'most transitions',      fallback: [0.25, 0.1, 0.25, 1] },
  { id: 'ease-emphasized', label: 'Emphasized', note: 'the era ring',          fallback: [0.2, 0.7, 0.2, 1] },
  { id: 'ease-spring',     label: 'Spring',     note: 'overshoots; spare',     fallback: [0.34, 1.56, 0.64, 1] },
];
/** The four control points. x stays in [0, 1] as CSS requires; y may overshoot. */
export const EASING_POINTS = [
  { key: 0, label: 'x1', min: 0,  max: 1 },
  { key: 1, label: 'y1', min: -1, max: 2 },
  { key: 2, label: 'x2', min: 0,  max: 1 },
  { key: 3, label: 'y2', min: -1, max: 2 },
];
export const EASING_PRESETS = [
  { label: 'Ease',        pts: [0.25, 0.1, 0.25, 1] },
  { label: 'Ease in',     pts: [0.42, 0, 1, 1] },
  { label: 'Ease out',    pts: [0, 0, 0.58, 1] },
  { label: 'Ease in-out', pts: [0.42, 0, 0.58, 1] },
  { label: 'Emphasized',  pts: [0.2, 0.7, 0.2, 1] },
  { label: 'Spring',      pts: [0.34, 1.56, 0.64, 1] },
  { label: 'Linear',      pts: [0, 0, 1, 1] },
];

const round2 = n => Math.round(n * 100) / 100;
const BEZIER = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/;
const KEYWORDS = { ease: [0.25, 0.1, 0.25, 1], linear: [0, 0, 1, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] };

/** Control points from a timing-function value, or null. */
export function parseEasing(text) {
  const t = (text || '').trim();
  if (KEYWORDS[t]) return [...KEYWORDS[t]];
  const m = BEZIER.exec(t);
  return m ? m.slice(1, 5).map(Number) : null;
}
/** Seconds from a time value ("0.2s", "200ms"), or NaN. */
export function parseSeconds(text) {
  const m = /^\s*(-?\d*\.?\d+)\s*(ms|s)\s*$/.exec(text || '');
  return m ? (m[2] === 'ms' ? Number(m[1]) / 1000 : Number(m[1])) : NaN;
}
export const bezierCss = pts => `cubic-bezier(${pts.map(round2).join(', ')})`;

function readDefaults() {
  const cs = typeof document !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  const durations = Object.fromEntries(DURATION_TOKENS.map(t => {
    const v = cs ? parseSeconds(cs.getPropertyValue(`--${t.id}`)) : NaN;
    return [t.id, Number.isFinite(v) ? v : t.fallback];
  }));
  const easings = Object.fromEntries(EASING_TOKENS.map(t => {
    const v = cs ? parseEasing(cs.getPropertyValue(`--${t.id}`)) : null;
    return [t.id, v ?? [...t.fallback]];
  }));
  return { durations, easings };
}

export const useMotionStore = defineStore('motion', () => {
  const defaults = readDefaults();
  const durations = reactive({ ...defaults.durations });
  const easings = reactive(Object.fromEntries(Object.entries(defaults.easings).map(([k, v]) => [k, [...v]])));

  function apply() {
    const root = document.documentElement.style;
    for (const t of DURATION_TOKENS) root.setProperty(`--${t.id}`, `${durations[t.id]}s`);
    for (const t of EASING_TOKENS) root.setProperty(`--${t.id}`, bezierCss(easings[t.id]));
  }

  function setDuration(id, value) {
    if (!(id in durations)) return;
    durations[id] = round2(Math.min(DURATION_RANGE.max, Math.max(DURATION_RANGE.min, Number(value))));
  }
  function setPoint(id, key, value) {
    const p = EASING_POINTS[key];
    if (!(id in easings) || !p) return;
    easings[id][key] = round2(Math.min(p.max, Math.max(p.min, Number(value))));
  }
  function setEasing(id, pts) { if (id in easings) pts.forEach((v, i) => setPoint(id, i, v)); }

  const easingCss = id => bezierCss(easings[id]);
  const ms = id => Math.round(durations[id] * 1000);

  function resetOne(id) {
    if (id in defaults.durations) durations[id] = defaults.durations[id];
    if (id in defaults.easings) easings[id].splice(0, 4, ...defaults.easings[id]);
  }
  function reset() { [...DURATION_TOKENS, ...EASING_TOKENS].forEach(t => resetOne(t.id)); }
  const isDefault = id => (id in durations
    ? durations[id] === defaults.durations[id]
    : easings[id].every((v, i) => v === defaults.easings[id][i]));

  watch([durations, easings], apply, { deep: true, immediate: true });

  useUndoStore().track('durations', durations);   // ⌘Z (stores/undo.js)
  useUndoStore().track('easings', easings);

  return { durations, easings, defaults, setDuration, setPoint, setEasing, easingCss, ms, resetOne, reset, isDefault };
});
