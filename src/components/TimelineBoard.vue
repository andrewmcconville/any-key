<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useOverlayNav } from '../composables/useOverlayNav';
import { ERAS, KEYS, ERA_WIDTH } from '../data/content';
import { UNLOCK_AT, useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';
import TimelineNode from './TimelineNode.vue';

const game = useGameStore();
const ui = useUiStore();
const nav = useOverlayNav();
const board = ref(null);
const tree = ref(null);
const rem = n => `${n / 10}rem`;
const BOARD_WIDTH = ERAS.length * ERA_WIDTH;
// The rail runs from the first key's tick to the last, not edge to edge.
const RAIL_START = KEYS[0].cx;
const RAIL_END = KEYS[KEYS.length - 1].cx;

// The track is what scrolls: slack before the tree so the first key sits at screen centre at
// scroll start, and it ends half a screen past the last key so that key sits at centre at scroll
// end (the tree's empty tail beyond that is clipped). 50% is half the board's visible width.
const slack = `max(0rem, calc(50% - ${rem(RAIL_START)}))`;
const trackStyle = {
  paddingLeft: slack,
  width: `calc(${slack} + ${rem(RAIL_END)} + 50%)`,
};

// canvas px → CSS px for this viewport
const scale = () => tree.value.offsetWidth / BOARD_WIDTH;
// CSS px of slack before the tree (the track's left padding)
const padLeft = () => tree.value.offsetLeft;

function onScroll() {
  const el = board.value;
  ui.boardScrolled = el.scrollLeft > 20;
  // Era in view = the era whose region holds the centre of the view: an era lights up the moment
  // its left edge crosses the centre of the screen, and stays lit until the next era's edge does.
  const centre = (el.scrollLeft + el.clientWidth / 2 - padLeft()) / scale();
  ui.eraInView = Math.min(ERAS.length, Math.max(1, Math.floor(centre / ERA_WIDTH) + 1));
}

// Jumping to an era centres its first key, the same spot Space bar occupies at scroll start,
// so Era I resolves to scrollLeft 0 and every other era lands with the same framing.
function scrollToEra(eraId, behavior = 'smooth') {
  stopGlide();
  const el = board.value;
  if (!el) return;
  const firstKeyX = padLeft() + ((eraId - 1) * ERA_WIDTH + RAIL_START) * scale();
  const left = Math.max(0, Math.min(firstKeyX - el.clientWidth / 2, el.scrollWidth - el.clientWidth));
  el.scrollTo({ left, behavior });
}

watch(() => ui.scrollRequest, req => scrollToEra(req.eraId));
onMounted(onScroll);

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
    :data-scrolled="ui.boardScrolled"
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
      <div ref="tree" class="tree">
        <div class="rail" :style="{ left: rem(RAIL_START), width: rem(RAIL_END - RAIL_START) }" />

        <section
          v-for="era in ERAS"
          :key="era.id"
          class="era-region"
          :data-locked="!game.isUnlocked(era.id)"
          :style="{ left: rem((era.id - 1) * ERA_WIDTH) }"
        >
          <p class="era-region__label t-label">ERA {{ era.numeral }} · {{ era.name }} · {{ era.years }}</p>
          <p class="era-region__lock t-label t-label--lc">{{ lockLine(era) }}</p>
        </section>

        <TimelineNode v-for="node in KEYS" :key="node.id" :node="node" @press="openKey" />
      </div>
    </div>

    <!-- Sits at the right edge of the first screen; scrolls away with the content and fades. -->
    <p class="swipe-hint t-label t-label--lc">swipe to explore →</p>
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
  align-items: center;    /* the tree is a fixed-height drawing; centre it so the rail sits mid-board */
  overflow: hidden;       /* fallback */
  overflow: clip;         /* clip the tree's empty tail without becoming a scroll container */
}
.tree {
  position: relative;
  flex: 0 0 auto;
  width: 720rem;          /* 4 eras × 180rem */
  height: 218.4rem;       /* twice the rail's y inside the tree (126rem − 16.8rem HUD top), so the rail is its centre */
}
.rail {
  position: absolute;            /* left/width set inline: first key tick → last key tick */
  top: calc(126rem - 16.8rem);   /* RAIL_Y minus HUD top */
  height: 0.6rem; margin-top: -0.3rem;
  background: var(--ink);
}
.era-region {
  position: absolute; top: 0; height: 100%;
  width: 180rem;
}
.era-region__label { position: absolute; left: 4.8rem; top: calc(20.8rem - 16.8rem); color: var(--muted); }
.era-region__lock  { position: absolute; left: 4.8rem; top: calc(26.4rem - 16.8rem); color: var(--muted); }
.era-region[data-locked="false"] .era-region__lock { display: none; }
.era-region[data-locked="true"] .era-region__label { opacity: .7; }
.swipe-hint {
  position: absolute;
  top: calc(50% + 4.8rem);         /* just under the rail, which sits at the board's vertical centre */
  right: 4.8rem;                   /* right edge of the board at scroll start */
  width: 56rem; text-align: right;
  color: var(--muted);
  transition: opacity var(--dur-md) var(--ease-standard);
}
.board[data-scrolled="true"] .swipe-hint { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .board { scroll-behavior: auto; }
}
</style>
