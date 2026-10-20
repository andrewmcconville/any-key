<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ERAS, KEYS, ERA_WIDTH } from '../data/content';
import { UNLOCK_AT, useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';
import TimelineNode from './TimelineNode.vue';

const game = useGameStore();
const ui = useUiStore();
const router = useRouter();
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
  // Era in view = the era showing the most of itself; ties go to the earlier era.
  const s = scale();
  const viewL = (el.scrollLeft - padLeft()) / s;
  const viewR = viewL + el.clientWidth / s;
  let best = 1, bestW = -1;
  for (const era of ERAS) {
    const l = (era.id - 1) * ERA_WIDTH;
    const w = Math.min(l + ERA_WIDTH, viewR) - Math.max(l, viewL);
    if (w > bestW) { best = era.id; bestW = w; }
  }
  ui.eraInView = best;
}

function scrollToEra(eraId, behavior = 'smooth') {
  board.value?.scrollTo({ left: padLeft() + (eraId - 1) * ERA_WIDTH * scale(), behavior });
}

watch(() => ui.scrollRequest, req => scrollToEra(req.eraId));
onMounted(onScroll);

// Click-and-drag scrolling for the mouse (touch already scrolls natively). A press only becomes
// a drag after DRAG_PX of movement, so an ordinary click on a key still opens it; once it is a
// drag, the pointer is captured and the click that follows the release is swallowed.
const DRAG_PX = 6;
const dragging = ref(false);
let drag = null;            // { id, startX, startScroll, moved }
let swallowClick = false;

function onPointerDown(e) {
  if (e.pointerType === 'touch' || e.button !== 0) return;
  swallowClick = false;
  drag = { id: e.pointerId, startX: e.clientX, startScroll: board.value.scrollLeft, moved: false };
}
function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.startX;
  if (!drag.moved) {
    if (Math.abs(dx) < DRAG_PX) return;
    drag.moved = true;
    dragging.value = true;
    board.value.setPointerCapture(e.pointerId);
  }
  board.value.scrollLeft = drag.startScroll - dx;
}
function onPointerUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  if (drag.moved) {
    board.value.releasePointerCapture(e.pointerId);
    swallowClick = true;
  }
  drag = null;
  dragging.value = false;
}
function onClickCapture(e) {
  if (!swallowClick) return;
  swallowClick = false;
  e.stopPropagation();
  e.preventDefault();
}

function openKey(node) {
  router.push({ name: 'key', params: { id: node.id } });
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

        <div
          v-for="era in ERAS.slice(1)"
          :key="`break-${era.id}`"
          class="rail-break"
          :style="{ left: rem((era.id - 1) * ERA_WIDTH - 40) }"
        >≈</div>

        <TimelineNode v-for="node in KEYS" :key="node.id" :node="node" @press="openKey" />
      </div>
    </div>

    <!-- Sits at the right edge of the first screen; scrolls away with the content and fades. -->
    <p class="swipe-hint t-label t-label--lc">swipe to explore →</p>
  </main>
</template>
