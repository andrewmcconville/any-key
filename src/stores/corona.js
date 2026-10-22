import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

/**
 * The corona's knobs, live: `Corona` reads them every frame, and the Corona window turns them.
 * `CORONA_DEFAULTS` is what everyone sees. Like the other design tools nothing persists: a refresh
 * returns to the defaults, and Copy values is how a decision leaves the browser (it copies this
 * block, ready to paste back here).
 *
 * Lengths are in the ring's units: the gauge is 100 across, so 48 is the ring's outer edge.
 */
export const CORONA_DEFAULTS = Object.freeze({
  drift: 0.5,         // how fast the noise drifts, in noise units a second
  hug: 16,            // the least the glow stands off the ring
  flare: 109,         // the most a lobe adds to that
  ripple: 6.5,        // the finer ripple's height
  lobes: 1.8,         // how many lobes fit around the ring: the noise's frequency around it
  ripples: 4.8,       // how many ripples fit around it
  rippleSpeed: 2.3,   // the ripple's drift, as a multiple of the lobes'
  innerOpacity: 0.5,  // the glow's opacity at the ring
  outerOpacity: 0,    // its opacity at each lobe's edge
  falloff: 1.6,       // how steeply it falls off between the two: 0 a straight line, more exponential
  blur: 2,            // in px
  hole: 47,           // the moon's radius, cut from the glow after the blur: the ring's stroke spans 42.5–47.5
});

/** Each knob as a slider: its label, a note, and its range. */
export const CORONA_CONTROLS = [
  { key: 'drift',        label: 'Speed',        note: 'how fast the shape drifts',        min: 0,   max: 0.6, step: 0.01 },
  { key: 'hug',          label: 'Stand-off',    note: 'the least the glow clears the ring', min: 0, max: 30, step: 1 },
  { key: 'flare',        label: 'Flare',        note: 'lobe height',                      min: 0,   max: 150, step: 1 },
  { key: 'lobes',        label: 'Lobes',        note: 'around the ring',                   min: 0.3, max: 4,   step: 0.1 },
  { key: 'ripple',       label: 'Ripple',       note: 'ripple height',                    min: 0,   max: 15,  step: 0.5 },
  { key: 'ripples',      label: 'Ripples',      note: 'around the ring',                   min: 1,   max: 10,  step: 0.2 },
  { key: 'rippleSpeed',  label: 'Ripple speed', note: '× speed',                          min: 0.2, max: 5,   step: 0.1 },
  { key: 'innerOpacity', label: 'Glow',         note: 'at the ring',                      min: 0,   max: 1,   step: 0.05 },
  { key: 'outerOpacity', label: 'Glow at edge', note: 'at each lobe\u2019s edge',          min: 0,   max: 1,   step: 0.05 },
  { key: 'falloff',      label: 'Fall-off',     note: '0 straight, more exponential',     min: 0,   max: 8,   step: 0.1 },
  { key: 'blur',         label: 'Blur',         note: 'px',                               min: 0,   max: 24,  step: 1 },
  { key: 'hole',         label: 'Hole',         note: 'the moon; the ring spans 42.5–47.5', min: 30, max: 56, step: 0.5 },
];

const decimals = c => (String(c.step).split('.')[1] || '').length;

/** How long a flare takes to die down, ms. */
export const FLARE_MS = 700;

export const useCoronaStore = defineStore('corona', () => {
  const settings = reactive({ ...CORONA_DEFAULTS });
  const flareAt = ref(-Infinity);    // when the corona last flared (performance.now())
  /** Flare: a key has landed on the gauge. The glow swells and settles over FLARE_MS. */
  function flare() { flareAt.value = performance.now(); }

  function set(key, value) {
    const c = CORONA_CONTROLS.find(x => x.key === key);
    if (!c) return;
    settings[key] = Number(Math.min(c.max, Math.max(c.min, Number(value))).toFixed(decimals(c)));
  }
  const resetOne = key => { if (key in CORONA_DEFAULTS) settings[key] = CORONA_DEFAULTS[key]; };
  function reset() { Object.assign(settings, CORONA_DEFAULTS); }
  const isDefault = key => settings[key] === CORONA_DEFAULTS[key];

  /** The knobs as they belong in CORONA_DEFAULTS. */
  function snapshot() {
    const lines = CORONA_CONTROLS.map(c => `  ${c.key}: ${settings[c.key]},${isDefault(c.key) ? '' : '   // changed'}`);
    return ['/* Any Key corona — paste into CORONA_DEFAULTS in stores/corona.js */', '{', ...lines, '}'].join('\n');
  }

  return { settings, defaults: CORONA_DEFAULTS, flareAt, flare, set, resetOne, reset, isDefault, snapshot };
});
