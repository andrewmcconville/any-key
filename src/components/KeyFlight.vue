<script setup>
import { onUnmounted, ref, watch } from 'vue';
import { useCoronaStore } from '../stores/corona';
import { useFlightStore } from '../stores/flight';
import { useUiStore } from '../stores/ui';

/**
 * The collect effect: when a key is collected, its cap lifts off the modal's collect button and
 * arcs up to the HUD gauge, shrinking as it goes, shedding a trail of its legend that falls away
 * behind it like the keystrokes it typed. On landing it strikes the counter: the gauge takes the
 * new count (the ring advances and the number pops, see HudTop) and the corona flares. It runs in
 * its own layer above the modal scrim, so the cap carries the eye back to the board as the modal
 * closes beneath it. With reduced motion there is no flight: the gauge counts the key at once.
 * Every number is a knob in the flight store; the Collect window turns them.
 */
const ui = useUiStore();
const corona = useCoronaStore();
const flight = useFlightStore();
const layer = ref(null);
const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const easing = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || 'ease';

let active = [];   // { cap, trail } for each cap in the air, so an unmount can clear them

function fly(f) {
  const gauge = document.querySelector('.gauge')?.getBoundingClientRect();
  if (!gauge || !layer.value) { ui.landFlight(f.n); return; }
  const sx = f.from.x + f.from.w / 2, sy = f.from.y + f.from.h / 2;
  const ex = gauge.left + gauge.width / 2, ey = gauge.top + gauge.height / 2;

  const k = { ...flight.settings };   // this flight's knobs, as they were at lift-off
  const cap = document.createElement('div');
  cap.className = 'cap t-label';
  cap.textContent = f.legend;
  cap.style.left = `${sx}px`;
  cap.style.top = `${sy}px`;
  cap.style.width = cap.style.height = `${k.capSize}rem`;
  layer.value.append(cap);
  const endScale = Math.max(0.1, (gauge.height * k.landScale) / cap.offsetHeight);
  const bow = ex >= sx ? -k.bow : k.bow;   // bow away from the direction of travel

  // Two motions make the arc: the cap travels straight to the gauge on the emphasized curve, while
  // its face bows sideways and shrinks along the way.
  const travel = cap.animate(
    [{ translate: '0 0' }, { translate: `${ex - sx}px ${ey - sy}px` }],
    { duration: k.duration, easing: easing('--ease-emphasized'), fill: 'forwards' },
  );
  cap.animate(
    [
      { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)' },
      { transform: `translate(calc(-50% + ${bow}px), -50%) scale(${(1 + endScale) / 2}) rotate(${bow > 0 ? k.tilt : -k.tilt}deg)`, offset: 0.5 },
      { transform: `translate(-50%, -50%) scale(${endScale}) rotate(0deg)` },
    ],
    { duration: k.duration, easing: easing('--ease-standard'), fill: 'forwards' },
  );

  // The trail: the legend, shed where the cap is, drifting down and fading.
  const trail = setInterval(() => {
    const r = cap.getBoundingClientRect();
    const mote = document.createElement('span');
    mote.className = 'mote t-label';
    mote.textContent = f.legend;
    mote.style.left = `${r.left + r.width / 2}px`;
    mote.style.top = `${r.top + r.height / 2}px`;
    layer.value?.append(mote);
    const dx = (Math.random() - 0.5) * k.trailScatter, dy = k.trailDrift * (0.6 + 0.4 * Math.random());
    mote.animate(
      [{ transform: 'translate(-50%, -50%) scale(0.9)', opacity: k.trailOpacity }, { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.5)`, opacity: 0 }],
      { duration: k.trailLife, easing: 'ease-out', fill: 'forwards' },
    ).finished.then(() => mote.remove(), () => mote.remove());
  }, k.trailEvery);

  const entry = { cap, trail };
  active.push(entry);
  const land = () => {
    clearInterval(trail);
    cap.remove();
    active = active.filter(e => e !== entry);
    ui.landFlight(f.n);
    corona.flare(k.flareMs, k.flareStrength);
  };
  travel.finished.then(land, land);
}

watch(() => ui.flight, f => {
  if (!f) return;
  if (reduced) { ui.landFlight(f.n); return; }
  fly(f);
});
onUnmounted(() => { active.forEach(e => { clearInterval(e.trail); e.cap.remove(); }); active = []; });
</script>

<template>
  <div ref="layer" class="flight" aria-hidden="true" />
</template>

<style scoped>
/* Above the overlays (10) and the toast (20), below the design-tool panels (50). */
.flight { position: fixed; inset: 0; z-index: 30; pointer-events: none; overflow: hidden; }
.flight :deep(.cap) {
  position: absolute;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-sm);
  background: var(--white);
  color: var(--ink);
  box-shadow: 0 0.6rem 0 var(--ink);
  display: grid; place-items: center;
  font-weight: 600;
  white-space: nowrap;
  will-change: transform, translate;
}
.flight :deep(.mote) {
  position: absolute;
  color: var(--muted);
  white-space: nowrap;
  will-change: transform, opacity;
}
</style>
