<script setup>
import { useOverlayNav } from '../composables/useOverlayNav';
import { usePanelsStore } from '../stores/panels';
import ModalShell from '../components/ModalShell.vue';
import AppButton from '../components/AppButton.vue';

const { close, open: go } = useOverlayNav();
const panels = usePanelsStore();

// Design tools are floating panels, not overlays: open one (at the given position, if any) and
// get the menu out of the way.
function openPanel(id, at) {
  panels.open(id, at);
  close();
}
</script>

<template>
  <ModalShell title="Menu" title-id="menu-title" @close="close">
    <nav class="menu" aria-label="Menu">
      <AppButton @click="go('stats')">STATS</AppButton>
      <AppButton @click="go('how-to-play')">HOW TO PLAY</AppButton>
      <AppButton @click="go('about')">ABOUT</AppButton>
      <AppButton @click="go('reset')">RESET</AppButton>
    </nav>
    <p class="menu__group t-label muted">Design tools</p>
    <nav class="menu" aria-label="Design tools">
      <AppButton @click="openPanel('type-tokens')">TYPOGRAPHY</AppButton>
      <AppButton @click="openPanel('colors', { x: 36, y: 120 })">COLOURS</AppButton>
      <AppButton @click="openPanel('shape', { x: 48, y: 168 })">BORDERS &amp; RADII</AppButton>
      <AppButton @click="openPanel('motion', { x: 60, y: 216 })">MOTION</AppButton>
      <AppButton @click="openPanel('corona', { x: 84, y: 312 })">CORONA</AppButton>
      <AppButton @click="openPanel('inspect', { x: 72, y: 264 })">INSPECT</AppButton>
    </nav>
    <p class="menu__hint t-label t-label--lc muted">Esc also opens and closes this menu</p>
  </ModalShell>
</template>

<style scoped>
.menu { display: flex; flex-direction: column; gap: 3.2rem; }
.menu__group { margin: 4.8rem 0 1.6rem; }
.menu__hint { text-align: center; margin-top: 4.8rem; }
</style>
