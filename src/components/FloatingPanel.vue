<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useInspectStore } from '../stores/inspect';
import { usePanelsStore } from '../stores/panels';

/**
 * A window that floats above the app. Drag it by its title bar; it stays inside the panel host
 * and comes to the front when touched. Position and stacking live in the panels store, so a
 * panel keeps its place across reloads and other panels can stack with it.
 */
const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  width: { type: String, default: '104rem' },
});

const panels = usePanelsStore();
const inspect = useInspectStore();   // every window's title bar carries a pick button for the Inspect tool
const state = computed(() => panels.get(props.id));
const el = ref(null);
const bar = ref(null);
const dragging = ref(false);

let drag = null;   // { pointerId, dx, dy } — pointer offset from the panel's top-left

// Where a panel may sit: up to half its width off either side, never above the top, and as low as
// leaves its title bar fully on screen (the body may hang below the viewport; the bar stays grabbable).
function clamp(x, y) {
  const host = el.value?.offsetParent;
  if (!host) return { x, y };
  const half = el.value.offsetWidth / 2;
  const maxY = Math.max(0, host.clientHeight - (bar.value?.offsetHeight ?? 0));
  return { x: Math.min(host.clientWidth - half, Math.max(-half, x)), y: Math.min(maxY, Math.max(0, y)) };
}

function onPointerDown(e) {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  panels.focus(props.id);
  drag = { pointerId: e.pointerId, dx: e.clientX - el.value.offsetLeft, dy: e.clientY - el.value.offsetTop };
  dragging.value = true;
  e.currentTarget.setPointerCapture(e.pointerId);
}
function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  const { x, y } = clamp(e.clientX - drag.dx, e.clientY - drag.dy);
  panels.move(props.id, x, y);
}
function onPointerUp(e) {
  if (!drag || e.pointerId !== drag.pointerId) return;
  drag = null;
  dragging.value = false;
}

// If the viewport is smaller than when the panel was last placed, pull it back on screen:
// whenever it opens (the element only exists while open) and whenever the window resizes or rotates.
function reclamp() {
  const s = state.value;
  if (!s?.open || !el.value) return;
  const { x, y } = clamp(s.x, s.y);
  if (x !== s.x || y !== s.y) panels.move(props.id, x, y);
}
watch(() => state.value?.open, open => { if (open) nextTick(reclamp); }, { immediate: true });
onMounted(() => window.addEventListener('resize', reclamp));
onUnmounted(() => window.removeEventListener('resize', reclamp));
</script>

<template>
  <section
    v-if="state?.open"
    ref="el"
    class="panel"
    :class="{ 'panel--dragging': dragging }"
    :style="{ left: state.x + 'px', top: state.y + 'px', zIndex: 100 + state.z, width }"
    role="dialog"
    :aria-label="title"
    @pointerdown="panels.focus(id)"
  >
    <header
      ref="bar"
      class="panel__bar"
      @pointerdown.stop="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <span class="panel__title t-label">{{ title }}</span>
      <span class="panel__tools">
        <button
          class="panel__tool"
          :class="{ 'panel__tool--on': inspect.picking }"
          type="button"
          aria-label="Pick an element to inspect"
          :aria-pressed="inspect.picking"
          @pointerdown.stop
          @click="inspect.togglePicking()"
        >
          <svg viewBox="0 0 56 56" aria-hidden="true"><circle cx="28" cy="28" r="11" /><path d="M28 6v10M28 40v10M6 28h10M40 28h10" /></svg>
        </button>
        <button class="panel__tool" type="button" aria-label="Close panel" @pointerdown.stop @click="panels.close(id)">
          <svg viewBox="0 0 56 56" aria-hidden="true"><path d="M16 16 40 40M40 16 16 40" /></svg>
        </button>
      </span>
    </header>
    <div class="panel__body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="panel__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.panel {
  position: absolute;
  max-width: calc(100% - 2.4rem);
  max-height: min(76vh, calc(100% - 2.4rem));   /* the body scrolls between a fixed title bar and footer */
  background: var(--white);
  border: 0.3rem solid var(--ink);
  border-radius: var(--radius-md);
  box-shadow: 0 2.4rem 6rem oklch(0 0 0 / 0.25);
  display: flex; flex-direction: column;
  overflow: hidden;
  touch-action: none;
}
.panel--dragging { box-shadow: 0 3.6rem 8rem oklch(0 0 0 / 0.3); }
.panel__bar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 2.4rem;
  height: 12rem;
  padding: 0 2.4rem 0 3.2rem;
  background: var(--bar);
  border-bottom: 0.3rem solid var(--ink);
  cursor: grab;
  user-select: none;
}
.panel--dragging .panel__bar { cursor: grabbing; }
.panel__title { color: var(--ink); }
.panel__tools { display: flex; align-items: center; gap: 1.6rem; flex: 0 0 auto; }
.panel__tool {
  width: 8.8rem; height: 8.8rem; border-radius: 50%;
  border: var(--stroke) solid var(--ink);
  background: var(--white);
  display: grid; place-items: center;
  cursor: pointer;
}
.panel__tool svg { width: 4rem; height: 4rem; stroke: var(--ink); stroke-width: 6; stroke-linecap: round; fill: none; }
.panel__tool--on { background: var(--ink); }
.panel__tool--on svg { stroke: var(--white); }
.panel__body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 3.2rem;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}
.panel__body::-webkit-scrollbar { display: none; }
/* Fixed like the title bar: the actions stay put while the body scrolls. */
.panel__footer {
  flex: 0 0 auto;
  padding: 2.4rem 3.2rem;
  background: var(--bar);
  border-top: 0.3rem solid var(--ink);
}
</style>
