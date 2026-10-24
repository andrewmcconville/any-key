<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOverlayNav } from '../composables/useOverlayNav';
import { COPY } from '../data/content';
import { COUNTDOWN_MS, IDLE_MS } from '../lib/kiosk';
import { useGameStore } from '../stores/game';
import { usePanelsStore } from '../stores/panels';
import { useUiStore } from '../stores/ui';
import AppButton from './AppButton.vue';

/**
 * The kiosk's idle reset (mounted only in kiosk mode, see lib/kiosk.js). After IDLE_MS without a
 * touch or a key, "Still there?" counts down from COUNTDOWN_MS. Any key or any touch keeps the
 * visitor's place, and that press does nothing else. At zero the collection resets, overlays and
 * design tools close, and the start screen comes back for the next visitor. On the start screen
 * itself nothing counts: that is where an idle kiosk belongs.
 */
const game = useGameStore();
const ui = useUiStore();
const panels = usePanelsStore();
const route = useRoute();
const router = useRouter();
const nav = useOverlayNav();
const copy = COPY.idle;

let last = Date.now();          // the visitor's last input
const deadline = ref(null);     // when the countdown runs out, or null while not counting down
const now = ref(Date.now());
const seconds = computed(() => (deadline.value === null ? 0 : Math.max(0, Math.ceil((deadline.value - now.value) / 1000))));
const unit = computed(() => (seconds.value === 1 ? copy.unitOne : copy.unit));
const button = ref(null);
const catching = ref(false);    // the prompt has gone but the touch that dismissed it is still down
let returnFocus = null;
let anchor = null;              // where the last pointer move that counted was

// Counting only matters once a visit is under way; the start screen is where an idle kiosk belongs.
const visiting = () => game.started && route.name !== 'start';

// Past the point of no return without a tick to notice: the device slept, or the tab was frozen,
// through the countdown. The press that wakes it must reset the board, not keep a stale one.
function overdue(t) {
  if (!visiting()) return false;
  return deadline.value !== null ? t >= deadline.value : t - last >= IDLE_MS + COUNTDOWN_MS;
}

// Every input counts as the visitor being there, except a pointer drifting a few px (a resting
// mouse or a noisy touchscreen). During the countdown any key or touch keeps their place; the key
// goes no further (no Esc closing a card, no Tab moving focus), and the touch's click lands on the
// prompt, or on a clear layer left for it, never on the board beneath.
function onInput(e) {
  const t = Date.now();
  if (e.type === 'pointermove') {
    if (anchor && Math.hypot(e.clientX - anchor.x, e.clientY - anchor.y) < 8) return;
    anchor = { x: e.clientX, y: e.clientY };
  }
  const swallow = () => { if (e.type === 'keydown') { e.preventDefault(); e.stopImmediatePropagation(); } };
  if (overdue(t)) { swallow(); expire(); return; }
  last = t;
  if (deadline.value === null) return;
  if (e.type === 'keydown') { swallow(); keep(); }
  else if (e.type === 'pointerdown') { catching.value = true; keep(); }
}
function release() {
  if (catching.value) setTimeout(() => { catching.value = false; }, 0);   // after the click that follows
}

function keep() {
  last = Date.now();
  deadline.value = null;
}

async function expire() {
  deadline.value = null;
  returnFocus = null;
  panels.closeAll();
  ui.hideToast();
  game.reset();                  // started becomes false: the router's guard shows the start screen
  await nav.closeAll();
  if (route.name !== 'start') await router.replace({ name: 'start' });
  ui.scrollToEra(1);
}

function tick() {
  now.value = Date.now();
  if (!visiting()) { deadline.value = null; last = now.value; return; }
  // A clock set back (the kiosk syncing its time) must not stretch the wait or the countdown.
  if (now.value < last) last = now.value;
  if (deadline.value !== null && deadline.value - now.value > COUNTDOWN_MS) deadline.value = now.value + COUNTDOWN_MS;
  if (deadline.value === null) {
    if (now.value - last >= IDLE_MS) deadline.value = now.value + COUNTDOWN_MS;
  } else if (now.value >= deadline.value) {
    expire();
  }
}

// The prompt takes focus while it shows (any key keeps the place anyway) and gives it back.
watch(deadline, (d, before) => {
  if (d !== null && before === null) {
    returnFocus = document.activeElement;
    nextTick(() => button.value?.$el.focus({ preventScroll: true }));
  } else if (d === null && returnFocus) {
    const el = returnFocus;
    returnFocus = null;
    nextTick(() => { if (el.isConnected) el.focus({ preventScroll: true }); });
  }
});

const EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel'];
let timer = null;
const RELEASES = ['pointerup', 'pointercancel'];
onMounted(() => {
  EVENTS.forEach(t => window.addEventListener(t, onInput, { capture: true, passive: t !== 'keydown' }));
  RELEASES.forEach(t => window.addEventListener(t, release, { capture: true, passive: true }));
  timer = setInterval(tick, 250);
});
onUnmounted(() => {
  EVENTS.forEach(t => window.removeEventListener(t, onInput, { capture: true }));
  RELEASES.forEach(t => window.removeEventListener(t, release, { capture: true }));
  clearInterval(timer);
});
</script>

<template>
  <div
    v-if="deadline !== null"
    class="idle"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="idle-title"
    aria-describedby="idle-count idle-body"
    @click="keep"
  >
    <div class="idle__sheet">
      <h2 id="idle-title" class="t-title">{{ copy.title }}</h2>
      <p id="idle-count" class="idle__count">
        <span class="t-display">{{ seconds }}</span>
        <span class="idle__unit t-label">{{ unit }}</span>
      </p>
      <p id="idle-body" class="idle__body t-body">{{ copy.body }}</p>
      <AppButton ref="button" keycap @click.stop="keep">{{ copy.button }}</AppButton>
    </div>
  </div>
  <div v-else-if="catching" class="idle idle--catch" aria-hidden="true" />
</template>

<style scoped>
/* Over everything the visitor uses (overlays 10, the notice 20, the collect flight 30), below the
   design-tool windows (50). Fixed, so it covers the whole screen and not just the stage. */
.idle {
  position: fixed; inset: 0;
  z-index: 40;
  display: grid; place-items: center;
  padding: var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left);
  background: var(--scrim);
}
.idle--catch { background: transparent; }
.idle__sheet {
  width: min(120rem, calc(100% - 9.6rem));
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 8rem 4.8rem 6rem;
  text-align: center;
  display: flex; flex-direction: column; gap: 4rem;
}
.idle__sheet h2 { margin: 0; }
.idle__count { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 0.8rem; font-variant-numeric: tabular-nums; }
.idle__unit { color: var(--muted); }
.idle__body { margin: 0; color: var(--muted); }
</style>
