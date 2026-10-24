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
const button = ref(null);
let returnFocus = null;

// Every input counts as the visitor being there. During the countdown a key also keeps their
// place and goes no further (no Esc closing a card, no Tab moving focus). A touch does the same
// through the prompt, which covers the screen (keep, below).
function onInput(e) {
  last = Date.now();
  if (deadline.value === null || e.type !== 'keydown') return;
  e.preventDefault();
  e.stopImmediatePropagation();
  keep();
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
  if (!game.started || route.name === 'start') { deadline.value = null; last = now.value; return; }
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
onMounted(() => {
  EVENTS.forEach(t => window.addEventListener(t, onInput, { capture: true, passive: t !== 'keydown' }));
  timer = setInterval(tick, 250);
});
onUnmounted(() => {
  EVENTS.forEach(t => window.removeEventListener(t, onInput, { capture: true }));
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
    aria-describedby="idle-body"
    @click="keep"
  >
    <div class="idle__sheet">
      <h2 id="idle-title" class="t-title">{{ copy.title }}</h2>
      <p class="idle__count">
        <span class="t-display">{{ seconds }}</span>
        <span class="idle__unit t-label">{{ copy.unit }}</span>
      </p>
      <p id="idle-body" class="idle__body t-body">{{ copy.body }}</p>
      <AppButton ref="button" keycap @click.stop="keep">{{ copy.button }}</AppButton>
    </div>
  </div>
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
