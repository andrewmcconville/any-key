<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useOverlayNav } from '../composables/useOverlayNav';
import { useGameStore } from '../stores/game';
import HudTop from '../components/HudTop.vue';
import HudBottom from '../components/HudBottom.vue';
import TimelineBoard from '../components/TimelineBoard.vue';
import ToastBanner from '../components/ToastBanner.vue';

const route = useRoute();
const nav = useOverlayNav();
const game = useGameStore();

// Esc on the bare board opens the menu. With an overlay open, ModalShell owns Esc (it closes).
function onKey(e) {
  if (e.key !== 'Escape' || route.name) return;
  nav.open('menu');
}
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));

// While any overlay is up (the start screen too) the board and both HUD bars are inert: nothing
// behind the sheet can be focused, tabbed to or clicked, so Tab stays in the overlay and Enter
// cannot open a second card from a key behind the first.
const covered = computed(() => !!route.name);

// The count, for screen readers, from outside the inert area: with reduced motion a key lands on
// the gauge while its card is still open, and an inert gauge would say nothing.
const countLine = computed(() => `${game.count} of ${game.total} keys collected`);

// When the overlays close, focus goes back to whatever opened them: the key on the board, or the
// HUD button. The opener is read before the board turns inert, which would take focus away from it.
// The start screen ends a visit (Reset, Start over, the kiosk's idle reset), so the next visitor
// does not inherit the last one's place.
let opener = null;
watch(() => route.name, (to, from) => {
  if (to === 'start') {
    opener = null;
  } else if (to && !from) {
    opener = document.activeElement;
  } else if (!to && from) {
    const el = opener;
    opener = null;
    if (el && el !== document.body) nextTick(() => { if (el.isConnected && !el.closest('[inert]')) el.focus({ preventScroll: true }); });
  }
});

// How overlays change over: 'layer' fades the whole layer in or out between the board and an
// overlay (the start screen counts as one: it has no modal sheet, so it always fades as a whole,
// as when Reset brings it back over the Reset dialog); between two modals the frame stays put
// (every modal is the same size) and only the sheet changes, 'fwd' when going deeper (the new
// sheet fades in on top), 'back' when returning (the old sheet fades out on top of the one
// beneath, which is simply there). See ModalShell.
const depth = () => Number(window.history.state?.overlayDepth) || 0;
let lastDepth = depth();
const transition = ref('layer');
watch(() => route.name, (to, from) => {
  const d = depth();
  const whole = !to || !from || to === 'start' || from === 'start';
  transition.value = whole ? 'layer' : d < lastDepth ? 'back' : 'fwd';
  lastDepth = d;
});
</script>

<template>
  <HudTop :inert="covered" />
  <TimelineBoard :inert="covered" />
  <ToastBanner :inert="covered" />
  <HudBottom :inert="covered" />
  <p class="sr-only" role="status">{{ countLine }}</p>

  <!-- Overlays (start screen, key detail, stats, …) are child routes layered over the board. -->
  <RouterView v-slot="{ Component }">
    <Transition :name="transition">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>
