<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useOverlayNav } from '../composables/useOverlayNav';
import { BOARD_WIDTH, ERAS, KEYS, RAIL_Y, YEAR_FROM, YEAR_TO, yearX } from '../data/content';
import { UNLOCK_AT, useGameStore } from '../stores/game';
import { useSwingStore } from '../stores/swing';
import { useUiStore } from '../stores/ui';
import TimelineNode from './TimelineNode.vue';

const game = useGameStore();
const ui = useUiStore();
const swing = useSwingStore();
const nav = useOverlayNav();
const board = ref(null);
const tree = ref(null);
const rem = n => `${n / 10}rem`;
const FIRST_X = KEYS[0].cx;
const LAST_X = KEYS[KEYS.length - 1].cx;

// The track is what scrolls: slack before the tree so the first key sits at screen centre at
// scroll start, and it ends half a screen and a gutter past the last key, so that key sits near
// centre at scroll end and the last era's label, which starts at that key's year, still clears the
// screen edge (the tree's empty tail beyond that is clipped). 50% is half the board's visible width.
const slack = `max(0rem, calc(50% - ${rem(FIRST_X)}))`;
const trackStyle = {
  paddingLeft: slack,
  width: `calc(${slack} + ${rem(LAST_X)} + 50% + var(--hud-gutter))`,
};

// The ruler along the rail: a tick every year, taller every five years and tallest at each decade,
// which is numbered above it. Heights in canvas px above the rail.
const TICK = 44;
const tickHeight = year => (year % 10 === 0 ? TICK : year % 5 === 0 ? 28 : 16);
const YEARS = Array.from({ length: YEAR_TO - YEAR_FROM + 1 }, (_, i) => YEAR_FROM + i);
const DECADES = YEARS.filter(year => year % 10 === 0);
const ticks = YEARS.map(year => `M ${yearX(year)} ${TICK} v ${-tickHeight(year)}`).join(' ');

// canvas px → CSS px for this viewport
const scale = () => tree.value.offsetWidth / BOARD_WIDTH;
// CSS px of slack before the tree (the track's left padding)
const padLeft = () => tree.value.offsetLeft;

// The swipe hint fades with the scroll itself, gone by the time the board has moved HINT_FADE of
// a screen width, and comes back the same way if the player returns to the start.
const HINT_FADE = 0.4;
const hintOpacity = ref(1);

function onScroll() {
  const el = board.value;
  hintOpacity.value = Math.max(0, 1 - el.scrollLeft / (el.clientWidth * HINT_FADE));
  swingBy(el.scrollLeft);
  // Era in view = the era whose stretch holds the centre of the view: an era lights up the moment
  // its left edge crosses the centre of the screen, and stays lit until the next era's edge does.
  const centre = (el.scrollLeft + el.clientWidth / 2 - padLeft()) / scale();
  ui.eraInView = ERAS.findLast(era => era.from <= centre)?.id ?? 1;
}

// Jumping to an era centres its first key, the same spot Space bar occupies at scroll start,
// so Era I resolves to scrollLeft 0 and every other era lands with the same framing.
function scrollToEra(eraId, behavior = 'smooth') {
  stopGlide();
  const el = board.value;
  if (!el) return;
  const firstKeyX = padLeft() + KEYS.find(k => k.era === eraId).cx * scale();
  const left = Math.max(0, Math.min(firstKeyX - el.clientWidth / 2, el.scrollWidth - el.clientWidth));
  el.scrollTo({ left, behavior });
}

watch(() => ui.scrollRequest, req => scrollToEra(req.eraId));
onMounted(onScroll);

// Scroll physics: the rail moves with the user's hand and the keys trail it on springs (see
// stores/swing.js). Each scroll step, in canvas px, is handed to the store as a kick.
let lastScroll = null;
function swingBy(scrollLeft) {
  if (lastScroll === null) { lastScroll = scrollLeft; return; }
  const delta = (scrollLeft - lastScroll) / scale();
  lastScroll = scrollLeft;
  swing.kick(delta);
}

// Click-and-drag scrolling for the mouse (touch already scrolls natively). A press only becomes
// a drag after DRAG_PX of movement, so an ordinary click on a key still opens it; once it is a
// drag, the pointer is captured and the click that follows the release is swallowed. Releasing
// mid-motion (a flick) hands the release velocity to a glide that decays with friction.
const DRAG_PX = 6;
const VELOCITY_WINDOW_MS = 100;   // pointer samples this recent set the release velocity
const FRICTION = 0.95;            // share of velocity kept per 16ms of glide
const MIN_VELOCITY = 0.02;        // px/ms; the glide stops below this
const dragging = ref(false);
let drag = null;            // { id, startX, startScroll, moved, samples: [{ t, x }] }
let swallowClick = false;
let glide = null;           // requestAnimationFrame id while coasting

function onPointerDown(e) {
  if (e.pointerType === 'touch' || e.button !== 0) return;
  stopGlide();
  swallowClick = false;
  drag = { id: e.pointerId, startX: e.clientX, startScroll: board.value.scrollLeft, moved: false, samples: [] };
}
function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.startX;
  if (!drag.moved) {
    if (Math.abs(dx) < DRAG_PX) return;
    drag.moved = true;
    dragging.value = true;
    try { board.value.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
  }
  board.value.scrollLeft = drag.startScroll - dx;
  drag.samples.push({ t: e.timeStamp, x: e.clientX });
  while (drag.samples.length && drag.samples[0].t < e.timeStamp - VELOCITY_WINDOW_MS) drag.samples.shift();
}
function onPointerUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  if (drag.moved) {
    try { board.value.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    swallowClick = true;
    startGlide(-releaseVelocity(drag.samples, e.timeStamp));
  }
  drag = null;
  dragging.value = false;
}

/** Pointer velocity (px/ms) over the recent samples; 0 if the pointer paused before release. */
function releaseVelocity(samples, now) {
  if (samples.length < 2) return 0;
  const first = samples[0], last = samples[samples.length - 1];
  if (now - last.t > VELOCITY_WINDOW_MS || last.t === first.t) return 0;
  return (last.x - first.x) / (last.t - first.t);
}
function startGlide(velocity) {
  if (Math.abs(velocity) < MIN_VELOCITY) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let v = velocity;
  let last = performance.now();
  const step = now => {
    const el = board.value;
    if (!el) return;
    const dt = Math.min(now - last, 50);   // a stalled frame must not jump the board
    last = now;
    el.scrollTo({ left: el.scrollLeft + v * dt, behavior: 'instant' });
    v *= FRICTION ** (dt / 16);
    const atEdge = el.scrollLeft <= 0 || el.scrollLeft >= el.scrollWidth - el.clientWidth;
    glide = Math.abs(v) < MIN_VELOCITY || atEdge ? null : requestAnimationFrame(step);
  };
  glide = requestAnimationFrame(step);
}
function stopGlide() {
  if (glide) cancelAnimationFrame(glide);
  glide = null;
}
onUnmounted(stopGlide);
function onClickCapture(e) {
  if (!swallowClick) return;
  swallowClick = false;
  e.stopPropagation();
  e.preventDefault();
}

function openKey(node) {
  nav.open('key', { id: node.id });
}

const lockLine = era => `LOCKED · collect ${UNLOCK_AT} keys in Era ${ERAS[era.id - 2]?.numeral ?? ''} to unlock`;
</script>

<template>
  <main
    ref="board"
    class="board"
    :data-dragging="dragging"
    @scroll.passive="onScroll"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel.passive="stopGlide"
    @click.capture="onClickCapture"
  >
    <div class="track" :style="trackStyle">
      <div ref="tree" class="tree" :style="{ width: rem(BOARD_WIDTH) }">
        <section
          v-for="era in ERAS"
          :key="era.id"
          class="era"
          :data-locked="!game.isUnlocked(era.id)"
          :style="{ left: rem(era.x) }"
        >
          <p class="era__label t-label">ERA {{ era.numeral }} · {{ era.name }} · {{ era.years }}</p>
          <p class="era__lock t-label t-label--lc">{{ lockLine(era) }}</p>
        </section>

        <span v-for="year in DECADES" :key="year" class="year t-label" :style="{ left: rem(yearX(year)), top: rem(RAIL_Y - TICK - 8) }">{{ year }}</span>
        <svg class="ticks" :style="{ top: rem(RAIL_Y - TICK), width: rem(BOARD_WIDTH), height: rem(TICK) }" :viewBox="`0 0 ${BOARD_WIDTH} ${TICK}`" aria-hidden="true">
          <path :d="ticks" />
        </svg>
        <div class="rail" :style="{ top: rem(RAIL_Y), width: rem(BOARD_WIDTH) }" />

        <TimelineNode v-for="node in KEYS" :key="node.id" :node="node" :lag="swing.lags[node.id]" @press="openKey" />
      </div>
    </div>

    <!-- Sits at the foot of the first screen, just above the bottom HUD; scrolls away with the content and fades with it. -->
    <p class="swipe-hint t-label t-label--lc" :style="{ opacity: hintOpacity }">swipe to explore →</p>
  </main>
</template>

<style scoped>
.board {
  position: relative;
  flex: 1 1 auto;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
  cursor: grab;
}
.board::-webkit-scrollbar { display: none; }
/* While dragging: follow the pointer directly (no smooth scrolling) and show a grabbing hand everywhere. */
.board[data-dragging="true"] { scroll-behavior: auto; }
.board[data-dragging="true"], .board[data-dragging="true"] :deep(*) { cursor: grabbing; }
.track {
  /* Width and left padding set inline from the key data (see <script>). */
  box-sizing: border-box;
  height: 100%;
  display: flex;
  overflow: hidden;       /* fallback */
  overflow: clip;         /* clip the tree's empty tail without becoming a scroll container */
}
.tree {
  position: relative;     /* width set inline: the ruler's length */
  flex: 0 0 auto;
  height: 100%;
}
.rail {
  position: absolute; left: 0;   /* top and width set inline: the ruler's length, at RAIL_Y */
  height: 0.6rem; margin-top: -0.3rem;
  background: var(--ink);
}
.ticks {
  position: absolute; left: 0;   /* sits on the rail; the end ticks overhang the box by half a stroke */
  overflow: visible;
}
/* Stroke in canvas px (the viewBox's units): 3 = 0.3rem. */
.ticks path { fill: none; stroke: var(--ink); stroke-width: 3; }
.year {
  position: absolute;            /* centred above its decade's tick, bottom edge 8 canvas px clear of it */
  translate: -50% -100%;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.era { position: absolute; top: 4rem; }
.era p { margin: 0; white-space: nowrap; color: var(--muted); }
.era .era__lock { margin-top: 0.6rem; }
.era[data-locked="false"] .era__lock { display: none; }
.era[data-locked="true"] .era__label { opacity: .7; }
.swipe-hint {
  position: absolute;
  bottom: 4.8rem;                  /* the board ends where the bottom HUD begins */
  left: 50%; translate: -50%;      /* centre of the board at scroll start */
  white-space: nowrap;
  color: var(--muted);
  pointer-events: none;            /* opacity is set inline from the scroll position */
}

@media (prefers-reduced-motion: reduce) {
  .board { scroll-behavior: auto; }
}
</style>
