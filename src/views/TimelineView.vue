<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useOverlayNav } from '../composables/useOverlayNav';
import HudTop from '../components/HudTop.vue';
import HudBottom from '../components/HudBottom.vue';
import TimelineBoard from '../components/TimelineBoard.vue';
import ToastBanner from '../components/ToastBanner.vue';

const route = useRoute();
const nav = useOverlayNav();

// Esc on the bare board opens the menu. With an overlay open, ModalShell owns Esc (it closes).
function onKey(e) {
  if (e.key !== 'Escape' || route.name) return;
  nav.open('menu');
}
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));

// How overlays change over: 'layer' fades the whole layer in or out between the board and an
// overlay; between two overlays the frame stays put (every modal is the same size) and only the
// sheet changes, 'fwd' when going deeper (the new sheet fades in on top), 'back' when returning
// (the old sheet fades out on top of the one beneath, which is simply there). See ModalShell.
const depth = () => Number(window.history.state?.overlayDepth) || 0;
let lastDepth = depth();
const transition = ref('layer');
watch(() => route.name, (to, from) => {
  const d = depth();
  transition.value = !to || !from ? 'layer' : d < lastDepth ? 'back' : 'fwd';
  lastDepth = d;
});
</script>

<template>
  <HudTop />
  <TimelineBoard />
  <ToastBanner />
  <HudBottom />

  <!-- Overlays (start screen, key detail, stats, …) are child routes layered over the board. -->
  <RouterView v-slot="{ Component }">
    <Transition :name="transition">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>
