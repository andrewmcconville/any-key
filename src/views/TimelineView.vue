<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import HudTop from '../components/HudTop.vue';
import HudBottom from '../components/HudBottom.vue';
import TimelineBoard from '../components/TimelineBoard.vue';
import ToastBanner from '../components/ToastBanner.vue';

const route = useRoute();
const router = useRouter();

// Esc on the bare board opens the menu. With an overlay open, ModalShell owns Esc (it closes).
function onKey(e) {
  if (e.key !== 'Escape' || route.name) return;
  router.push({ name: 'menu' });
}
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <HudTop />
  <TimelineBoard />
  <ToastBanner />
  <HudBottom />

  <!-- Overlays (start screen, key detail, stats, …) are child routes layered over the board. -->
  <RouterView v-slot="{ Component }">
    <Transition name="layer" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>
