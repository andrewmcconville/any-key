<script setup>
import HudTop from '../components/HudTop.vue';
import HudBottom from '../components/HudBottom.vue';
import TimelineBoard from '../components/TimelineBoard.vue';
import ToastBanner from '../components/ToastBanner.vue';
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
