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
      <AppButton @click="go('about')">ABOUT</AppButton>
      <AppButton @click="go('reset')">RESET</AppButton>
    </nav>
    <p class="menu__group t-label muted">Design tools</p>
    <!-- Two columns, filled top to bottom: what things look like on the left, how they move on the right. -->
    <nav class="menu menu--tools" aria-label="Design tools">
      <AppButton @click="openPanel('type-tokens')">TYPOGRAPHY</AppButton>
      <AppButton @click="openPanel('colors', { x: 36, y: 120 })">COLOURS</AppButton>
      <AppButton @click="openPanel('shape', { x: 48, y: 168 })">BORDERS &amp; RADII</AppButton>
      <AppButton @click="openPanel('inspect', { x: 72, y: 264 })">INSPECT</AppButton>
      <AppButton @click="openPanel('corona', { x: 84, y: 312 })">CORONA</AppButton>
      <AppButton @click="openPanel('flight', { x: 96, y: 360 })">COLLECT</AppButton>
      <AppButton @click="openPanel('ring', { x: 108, y: 408 })">ERA RING</AppButton>
      <AppButton @click="openPanel('swing', { x: 120, y: 456 })">SCROLL PHYSICS</AppButton>
    </nav>
  </ModalShell>
</template>

<style scoped>
.menu { display: flex; flex-direction: column; gap: 3.2rem; }
/* The design tools, two to a row; a long name may take two lines. */
.menu--tools { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(4, auto); grid-auto-flow: column; gap: 2.4rem; }
.menu--tools :deep(.btn) { height: auto; min-height: 16rem; padding: 2.4rem 1.6rem; text-align: center; line-height: 1.2; }
.menu__group { margin: 4.8rem 0 1.6rem; }
</style>
