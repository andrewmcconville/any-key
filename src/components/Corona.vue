<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { perlin3 } from '../lib/noise';
import { FLARE_MS, useCoronaStore } from '../stores/corona';

/**
 * The corona round the HUD's key gauge: a glow behind the ring like the corona round an eclipse,
 * whose reach varies around the ring and drifts slowly, never the same twice. Its edge is Perlin
 * noise sampled around the circle, a slow swell of a lobe or two plus a finer ripple, with time as
 * the noise's third axis. It is painted pixel by pixel on a canvas: each pixel's opacity comes from
 * how far along its own lobe it sits, the inner opacity at the ring down to the outer one at that
 * lobe's edge, however far the lobe reaches, so a long lobe carries ink further out and a short one
 * ends just as softly. The canvas is then blurred so it reads as light, and only then is the hole
 * cut from it, so like the moon in an eclipse it hides the glow behind it with a crisp edge and the
 * corona is brightest right at its rim. With reduced motion it holds one frame. Its knobs are the
 * corona store's settings, live.
 *
 * The box is the gauge's own 100 units across, centred on (50, 50), plus REACH on every side; the
 * element sizes itself from its parent's box (the longer side) to match.
 */

/** The ring's outer edge, in the box's units: the ring draws out to 47.5 of 100. */
const EDGE = 48;
/** How far past the ring the box reaches on every side: room for the fullest flare, ripple and stand-off, blur included. */
const REACH = 200;
/** How many directions the reach is sampled in; pixels between them interpolate. */
const ANGLES = 720;
/** The canvas's longest side in device pixels: the blur hides anything finer. */
const MAX_PX = 384;
const UNITS = 100 + 2 * REACH;

const corona = useCoronaStore();
const settings = corona.settings;
const canvas = ref(null);

let ctx = null;
let px = 0;                 // the canvas's side, in device pixels
let radius = null;          // per pixel: its distance from the centre, in units
let bearing = null;         // per pixel: its direction, as a fractional index into `reach`
let image = null;
let side = 0;               // the canvas's side, in CSS px
let maskCss = '';
const reach = new Float32Array(ANGLES);
const curve = new Float32Array(257);

// Sized from the gauge's box, so the glow scales with it; the pixel geometry is fixed per size.
function resize(box) {
  side = Math.max(box.width, box.height) * (1 + 2 * REACH / 100);
  canvas.value.style.width = `${side}px`;
  canvas.value.style.height = `${side}px`;
  px = Math.max(1, Math.round(Math.min(side * (window.devicePixelRatio || 1), MAX_PX)));
  canvas.value.width = canvas.value.height = px;
  const n = px * px;
  radius = new Float32Array(n);
  bearing = new Float32Array(n);
  const unitsPerPx = UNITS / px, centre = px / 2;
  for (let y = 0, i = 0; y < px; y++) {
    const dy = (y + 0.5 - centre) * unitsPerPx;
    for (let x = 0; x < px; x++, i++) {
      const dx = (x + 0.5 - centre) * unitsPerPx;
      radius[i] = Math.hypot(dx, dy);
      bearing[i] = ((Math.atan2(dy, dx) / (2 * Math.PI) + 1) % 1) * ANGLES;
    }
  }
  image = ctx.createImageData(px, px);
}

/** Paint the moment `t` (seconds). */
function draw(t) {
  if (!ctx || !image) return;
  const { hole, lobes, ripples, drift, rippleSpeed, ripple, outerOpacity, falloff, blur } = settings;
  // A flare (a key landing on the gauge): the glow swells and the lobes reach further, settling
  // back over FLARE_MS on a quadratic so the strike is sharp and the fade is soft.
  const since = performance.now() - corona.flareAt;
  const boost = since >= 0 && since < FLARE_MS ? (1 - since / FLARE_MS) ** 2 : 0;
  const hug = settings.hug + 10 * boost;
  const flare = settings.flare + 70 * boost;
  const innerOpacity = Math.min(1, settings.innerOpacity + 0.45 * boost);
  // The edge, around the circle: the ring plus the stand-off and the noise.
  for (let i = 0; i < ANGLES; i++) {
    const angle = (i / ANGLES) * Math.PI * 2;
    const c = Math.cos(angle), s = Math.sin(angle);
    const lobe = 0.5 + 0.5 * perlin3(c * lobes, s * lobes, t * drift);
    const rip = perlin3(c * ripples + 7, s * ripples + 7, t * drift * rippleSpeed);
    reach[i] = Math.min(EDGE + REACH - 4, EDGE + hug + flare * lobe + ripple * rip);
  }
  // The fall-off along a lobe, from the ring (0) to its edge (1): an exponential as steep as
  // `falloff`, a straight line at 0, between the inner and outer opacities.
  const k = Math.exp(-falloff);
  for (let j = 0; j <= 256; j++) {
    const x = j / 256;
    const f = falloff <= 0 ? 1 - x : (Math.exp(-falloff * x) - k) / (1 - k);
    curve[j] = outerOpacity + (innerOpacity - outerOpacity) * f;
  }
  // Each pixel: nothing beyond its lobe's edge; within, its share of the lobe. The glow is painted
  // full right in to the centre, so the blur has ink on both sides of the hole's rim; the hole
  // itself is cut out after the blur, below.
  const data = image.data;
  for (let i = 0, n = px * px; i < n; i++) {
    const r = radius[i];
    const b = bearing[i], b0 = Math.floor(b), frac = b - b0;
    const edge = reach[b0] + (reach[(b0 + 1) % ANGLES] - reach[b0]) * frac;
    let a = 0;
    if (r < edge) {
      const x = Math.max(0, (r - EDGE) / Math.max(edge - EDGE, 0.001));
      a = curve[Math.min(256, Math.round(x * 256))];
    }
    data[i * 4 + 3] = a * 255;
  }
  ctx.putImageData(image, 0, 0);
  // The alpha mask takes the ink's colour, whatever the Colours tool has made it.
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = getComputedStyle(canvas.value).color;
  ctx.fillRect(0, 0, px, px);
  ctx.globalCompositeOperation = 'source-over';
  canvas.value.style.filter = `blur(${blur}px)`;
  // The moon: a mask cuts the hole after the filter (CSS filters apply before masks), with a crisp rim.
  const holePx = (hole * side) / UNITS;
  const mask = `radial-gradient(circle, transparent ${holePx.toFixed(2)}px, #000 ${(holePx + 0.5).toFixed(2)}px)`;
  if (mask !== maskCss) { maskCss = mask; canvas.value.style.mask = mask; canvas.value.style.webkitMask = mask; }
}

// The drift: one frame per screen refresh, unless the visitor asks for reduced motion, when it
// holds one frame and only repaints as the knobs turn.
const drifts = !(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
let frame = 0;
let seconds = 0;
function drift() {
  if (!drifts || frame) return;
  const startedAt = performance.now() - seconds * 1000;
  const tick = now => { seconds = (now - startedAt) / 1000; draw(seconds); frame = requestAnimationFrame(tick); };
  frame = requestAnimationFrame(tick);
}
function hold() { cancelAnimationFrame(frame); frame = 0; }
watch(settings, () => { if (!drifts) draw(seconds); });

let observer = null;
onMounted(() => {
  ctx = canvas.value.getContext('2d');
  const box = canvas.value.parentElement;
  const fit = () => { resize(box.getBoundingClientRect()); draw(seconds); };
  if (typeof ResizeObserver === 'function') { observer = new ResizeObserver(fit); observer.observe(box); } else fit();
  drift();
});
onUnmounted(() => { hold(); observer?.disconnect(); });
</script>

<template>
  <canvas ref="canvas" class="corona" aria-hidden="true" />
</template>

<style scoped>
/* Behind the ring, centred on it (the gauge isolates the stacking). Ink is the glow's colour. */
.corona {
  position: absolute;
  top: 50%; left: 50%;
  translate: -50% -50%;
  z-index: -1;
  color: var(--ink);
  pointer-events: none;
}
</style>
