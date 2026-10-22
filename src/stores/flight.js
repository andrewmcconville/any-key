import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { useGameStore } from './game';
import { useUiStore } from './ui';

/**
 * The collect effect's knobs, live: `KeyFlight` reads them for every flight, the corona's flare
 * takes its length and strength from them, and the Collect window turns them. `FLIGHT_DEFAULTS`
 * is what everyone sees. Like the other design tools nothing persists: a refresh returns to the
 * defaults, and Copy values is how a decision leaves the browser (it copies this block).
 */
export const FLIGHT_DEFAULTS = Object.freeze({
  duration: 800,        // the cap's flight, ms
  beat: 600,            // how long the modal stays after the press, ms
  bow: 56,              // how far the arc bows out from the straight line, px
  capSize: 12,          // the cap's side as it lifts off, rem
  landScale: 0.7,       // the cap's size on landing, as a share of the gauge
  tilt: 8,              // how far the cap tilts mid-flight, degrees
  trailEvery: 45,       // ms between motes of the trail
  trailLife: 520,       // how long a mote lasts, ms
  trailDrift: 24,       // how far a mote falls, px
  trailScatter: 16,     // how far a mote strays sideways, px
  trailOpacity: 0.8,    // a mote's opacity as it is shed
  flareMs: 700,         // how long the corona's flare takes to settle
  flareStrength: 1,     // how hard the corona flares, × the built-in swell
});

/** Each knob as a slider: its label, a note, how its value reads, and its range. */
export const FLIGHT_CONTROLS = [
  { key: 'duration',      label: 'Flight',        note: 'button to gauge',             unit: 'ms',  min: 200, max: 2000, step: 50 },
  { key: 'beat',          label: 'Beat',          note: 'modal stays after the press', unit: 'ms',  min: 0,   max: 1500, step: 50 },
  { key: 'bow',           label: 'Bow',           note: 'how far the arc bows out',    unit: 'px',  min: 0,   max: 160,  step: 4 },
  { key: 'capSize',       label: 'Cap size',      note: 'at lift-off',                 unit: 'rem', min: 6,   max: 24,   step: 0.5 },
  { key: 'landScale',     label: 'Landing size',  note: '× the gauge',                 unit: '×',   min: 0.3, max: 1.2,  step: 0.05 },
  { key: 'tilt',          label: 'Tilt',          note: 'mid-flight',                  unit: '°',   min: 0,   max: 30,   step: 1 },
  { key: 'trailEvery',    label: 'Trail spacing', note: 'between motes',               unit: 'ms',  min: 15,  max: 150,  step: 5 },
  { key: 'trailLife',     label: 'Trail life',    note: 'a mote lasts',                unit: 'ms',  min: 100, max: 1500, step: 20 },
  { key: 'trailDrift',    label: 'Trail drift',   note: 'how far a mote falls',        unit: 'px',  min: 0,   max: 60,   step: 2 },
  { key: 'trailScatter',  label: 'Trail scatter', note: 'sideways stray',              unit: 'px',  min: 0,   max: 40,   step: 2 },
  { key: 'trailOpacity',  label: 'Trail opacity', note: 'as a mote is shed',           unit: '',    min: 0,   max: 1,    step: 0.05 },
  { key: 'flareMs',       label: 'Flare',         note: 'the corona settles over',     unit: 'ms',  min: 100, max: 2000, step: 50 },
  { key: 'flareStrength', label: 'Flare strength', note: '× the built-in swell',       unit: '×',   min: 0,   max: 2,    step: 0.1 },
];

const decimals = c => (String(c.step).split('.')[1] || '').length;

export const useFlightStore = defineStore('flight', () => {
  const settings = reactive({ ...FLIGHT_DEFAULTS });
  const ui = useUiStore();
  const game = useGameStore();

  function set(key, value) {
    const c = FLIGHT_CONTROLS.find(x => x.key === key);
    if (!c) return;
    settings[key] = Number(Math.min(c.max, Math.max(c.min, Number(value))).toFixed(decimals(c)));
  }
  const resetOne = key => { if (key in FLIGHT_DEFAULTS) settings[key] = FLIGHT_DEFAULTS[key]; };
  function reset() { Object.assign(settings, FLIGHT_DEFAULTS); }
  const isDefault = key => settings[key] === FLIGHT_DEFAULTS[key];

  /**
   * Play the effect without collecting anything: a ⌘ cap lifts off from above the era dots (or
   * from the open modal's collect button) and strikes the gauge, which keeps its count.
   */
  function play() {
    const button = document.querySelector('.modal .btn--keycap');
    const eras = document.querySelector('.eras');
    let from;
    if (button) from = button.getBoundingClientRect();
    else if (eras) { const r = eras.getBoundingClientRect(); from = { left: r.left + r.width / 2 - 30, top: r.top - 100, width: 60, height: 60 }; }
    else from = { left: window.innerWidth / 2 - 30, top: window.innerHeight * 0.7, width: 60, height: 60 };
    ui.launchFlight(from, '⌘', game.count);
  }

  /** The knobs as they belong in FLIGHT_DEFAULTS. */
  function snapshot() {
    const lines = FLIGHT_CONTROLS.map(c => `  ${c.key}: ${settings[c.key]},${isDefault(c.key) ? '' : '   // changed'}`);
    return ['/* Any Key collect effect — paste into FLIGHT_DEFAULTS in stores/flight.js */', '{', ...lines, '}'].join('\n');
  }

  return { settings, defaults: FLIGHT_DEFAULTS, set, resetOne, reset, isDefault, play, snapshot };
});
