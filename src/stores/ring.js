import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import { EASING_TOKENS } from './motion';
import { replayAll } from '../lib/replay';

/**
 * The era ring's knobs: how long its stretch takes, how far behind the trailing edge sets off,
 * and which easing each edge follows. They are the --ring-* tokens on :root in styles.css; this
 * store writes only what differs from `RING_DEFAULTS` (and clears it on reset), so by default the
 * stylesheet's own links hold: the duration follows --dur-md and the easings follow their tokens.
 * Like the other design tools nothing persists: Copy values is how a decision leaves the browser.
 */
export const RING_DEFAULTS = Object.freeze({
  duration: 300,              // the stretch, ms (the stylesheet links it to --dur-md)
  lag: 80,                    // how far behind the trailing edge sets off, ms
  lead: 'ease-emphasized',    // the leading edge's easing token
  trail: 'ease-standard',     // the trailing edge's easing token
});

/** The knobs: two sliders and two easing menus. */
export const RING_CONTROLS = [
  { key: 'duration', label: 'Stretch',       note: 'how long the ring takes',          kind: 'time', min: 0, max: 1000, step: 10 },
  { key: 'lag',      label: 'Lag',           note: 'the trailing edge sets off after', kind: 'time', min: 0, max: 400,  step: 10 },
  { key: 'lead',     label: 'Leading ease',  note: 'the edge that sets off first',     kind: 'easing' },
  { key: 'trail',    label: 'Trailing ease', note: 'the edge that follows',            kind: 'easing' },
];
export const RING_EASINGS = EASING_TOKENS.map(t => ({ id: t.id, label: t.label }));

export const useRingStore = defineStore('ring', () => {
  const settings = reactive({ ...RING_DEFAULTS });

  /** A knob's value as the stylesheet writes it. */
  const css = key => (key === 'duration' || key === 'lag' ? `${settings[key] / 1000}s` : `var(--${settings[key]})`);
  const PROP = { duration: '--ring-duration', lag: '--ring-lag', lead: '--ring-ease-lead', trail: '--ring-ease-trail' };

  function apply() {
    const root = document.documentElement.style;
    for (const key of Object.keys(PROP)) {
      if (settings[key] === RING_DEFAULTS[key]) root.removeProperty(PROP[key]);
      else root.setProperty(PROP[key], css(key));
    }
  }

  function set(key, value) {
    const c = RING_CONTROLS.find(x => x.key === key);
    if (!c) return;
    if (c.kind === 'easing') { if (RING_EASINGS.some(e => e.id === value)) settings[key] = value; }
    else settings[key] = Math.round(Math.min(c.max, Math.max(c.min, Number(value))) / c.step) * c.step;
  }
  const resetOne = key => { if (key in RING_DEFAULTS) settings[key] = RING_DEFAULTS[key]; };
  function reset() { Object.assign(settings, RING_DEFAULTS); }
  const isDefault = key => settings[key] === RING_DEFAULTS[key];

  /** Run the ring: it slides to a neighbouring era and back (see EraDots). */
  function play() { replayAll('.era-ring'); }

  /** The knobs as they belong in styles.css. */
  function snapshot() {
    const lines = Object.keys(PROP).map(key => `  ${PROP[key]}: ${key === 'duration' && isDefault(key) ? 'var(--dur-md)' : css(key)};${isDefault(key) ? '' : '   /* changed */'}`);
    return ['/* Any Key era ring */', ':root {', ...lines, '}'].join('\n');
  }

  watch(settings, apply, { immediate: true });

  return { settings, defaults: RING_DEFAULTS, css, set, resetOne, reset, isDefault, play, snapshot };
});
