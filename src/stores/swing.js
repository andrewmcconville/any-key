import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { KEYS, RAIL_Y } from '../data/content';
import { useUndoStore } from './undo';

/**
 * Scroll physics. The rail is bolted to the board and moves with the user's hand; each key hangs
 * from it by a ball chain and has inertia, so when the board moves the key stays where it was for
 * a moment and swings back on a damped spring. `lags` holds each key's displacement along the rail
 * in canvas px; TimelineNode turns it into the chain's angle and the key's tilt.
 * Longer chains swing slower, like longer pendulums (ω ∝ 1/√L), so the rows fall out of step.
 * The Scroll physics window turns the knobs; `SWING_DEFAULTS` is what everyone sees.
 */
export const SWING_DEFAULTS = Object.freeze({
  inertia: 1,           // share of each scroll step a key keeps (1: it holds its screen position exactly)
  maxLag: 72,           // canvas px a key may trail the rail by
  frequency: 2.4,       // Hz, the shortest chain's natural frequency
  damping: 0.42,        // damping ratio: under 1 overshoots and settles, 1 is critical, over 1 is sluggish
  lengthEffect: 0.5,    // how chain length slows the swing: ω ∝ (L₀/L)^this; 0.5 is a pendulum, 0 is none
  tilt: 1,              // the key's tilt, × the angle of its chain (1: the key hangs in line with it)
  nameTrail: 0.35,      // the name trails the key by this × the lag
  yearTrail: 0.7,       // the year trails the key by this × the lag
});

/** Each knob as a slider: its label, a note, how its value reads, and its range. */
export const SWING_CONTROLS = [
  { key: 'inertia',      label: 'Inertia',       note: 'share of a scroll step a key keeps',   unit: '×',  min: 0,    max: 2,   step: 0.05 },
  { key: 'maxLag',       label: 'Max lag',       note: 'how far a key may trail the rail',    unit: 'px', min: 0,    max: 200, step: 4 },
  { key: 'frequency',    label: 'Frequency',     note: 'of the shortest chain',               unit: 'Hz', min: 0.5,  max: 6,   step: 0.1 },
  { key: 'damping',      label: 'Damping',       note: '1 is critical; under it bounces',     unit: '',   min: 0.05, max: 2,   step: 0.01 },
  { key: 'lengthEffect', label: 'Length effect', note: '0.5 is a pendulum, 0 all in step',    unit: '',   min: 0,    max: 1.5, step: 0.05 },
  { key: 'tilt',         label: 'Tilt',          note: '× the chain\'s angle',                unit: '×',  min: 0,    max: 2,   step: 0.05 },
  { key: 'nameTrail',    label: 'Name trail',    note: 'the name lags the key by',            unit: '×',  min: 0,    max: 2,   step: 0.05 },
  { key: 'yearTrail',    label: 'Year trail',    note: 'the year lags the key by',            unit: '×',  min: 0,    max: 2,   step: 0.05 },
];

const REST = 0.05;          // below this displacement and speed a key is still
const MAX_PHASE = 0.25;     // rad of the stiffest spring per integration step; symplectic Euler is safe well under 2
const MAX_STEPS = 32;       // sub-steps per frame at most, so a long stall costs bounded work
const decimals = c => (String(c.step).split('.')[1] || '').length;

/** Each key's chain length, canvas px: rail to the key's edge (a photo is the larger box). */
export const RODS = KEYS.map(k => ({ id: k.id, length: Math.abs(RAIL_Y - k.cy) - (k.photo ? 170 : 108) }));
// The shortest circle key's chain: the frequency knob refers to it.
const SHORTEST_ROD = Math.min(...RODS.filter((_, i) => !KEYS[i].photo).map(rod => rod.length));

export const useSwingStore = defineStore('swing', () => {
  const settings = reactive({ ...SWING_DEFAULTS });
  const lags = reactive(Object.fromEntries(KEYS.map(k => [k.id, 0])));
  const velocities = Object.fromEntries(KEYS.map(k => [k.id, 0]));   // canvas px/s, not reactive
  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null;
  let last = 0;

  const omega = rod => 2 * Math.PI * settings.frequency * (SHORTEST_ROD / rod.length) ** settings.lengthEffect;

  /** The board moved by `delta` canvas px; every key keeps its screen position for this instant. */
  function kick(delta) {
    if (!delta || (reducedMotion && reducedMotion.matches)) return;
    const step = delta * settings.inertia;
    for (const rod of RODS) lags[rod.id] = Math.max(-settings.maxLag, Math.min(settings.maxLag, lags[rod.id] + step));
    run();
  }
  function run() {
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(settle);
  }
  // One frame of the springs. A stalled frame (tab switch, a long task) arrives with a big dt, and a
  // stiff spring (the Frequency and Length effect knobs high) would blow up if integrated in one
  // step, so the frame is cut into sub-steps short enough for the stiffest rod, and the
  // displacement is held within the lag limit however the numbers fall.
  function settle(now) {
    const dt = Math.min(now - last, 50) / 1000;   // s; the cap also bounds how far a stall is replayed
    last = now;
    const stiffest = Math.max(...RODS.map(omega));
    const steps = Math.min(MAX_STEPS, Math.max(1, Math.ceil(stiffest * dt / MAX_PHASE)));
    const h = dt / steps;
    const zeta = settings.damping;
    const limit = settings.maxLag;
    let moving = false;
    for (const rod of RODS) {
      const w = omega(rod);
      let x = lags[rod.id];
      let v = velocities[rod.id];
      for (let i = 0; i < steps; i++) {
        v += (-w * w * x - 2 * zeta * w * v) * h;
        x += v * h;
      }
      if (x > limit) { x = limit; v = Math.min(v, 0); }
      else if (x < -limit) { x = -limit; v = Math.max(v, 0); }
      if (Math.abs(x) < REST && Math.abs(v) < REST) { x = 0; v = 0; } else moving = true;
      lags[rod.id] = x;
      velocities[rod.id] = v;
    }
    frame = moving ? requestAnimationFrame(settle) : null;
  }

  /** A flick to the right without scrolling: every key swings from full lag, so the knobs can be heard. */
  function play() {
    for (const rod of RODS) { lags[rod.id] = settings.maxLag; velocities[rod.id] = 0; }
    run();
  }

  function set(key, value) {
    const c = SWING_CONTROLS.find(x => x.key === key);
    if (!c) return;
    settings[key] = Number(Math.min(c.max, Math.max(c.min, Number(value))).toFixed(decimals(c)));
  }
  const resetOne = key => { if (key in SWING_DEFAULTS) settings[key] = SWING_DEFAULTS[key]; };
  function reset() { Object.assign(settings, SWING_DEFAULTS); }
  const isDefault = key => settings[key] === SWING_DEFAULTS[key];

  /** The knobs as they belong in SWING_DEFAULTS. */
  function snapshot() {
    const lines = SWING_CONTROLS.map(c => `  ${c.key}: ${settings[c.key]},${isDefault(c.key) ? '' : '   // changed'}`);
    return ['/* Any Key scroll physics — paste into SWING_DEFAULTS in stores/swing.js */', '{', ...lines, '}'].join('\n');
  }

  useUndoStore().track('swing', settings);   // ⌘Z (stores/undo.js)

  return { settings, lags, defaults: SWING_DEFAULTS, kick, play, set, resetOne, reset, isDefault, snapshot };
});
