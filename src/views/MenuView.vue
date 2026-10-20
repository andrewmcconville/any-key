<script setup>
import { useReturnTo } from '../composables/useReturnTo';
import ModalShell from '../components/ModalShell.vue';
import AppButton from '../components/AppButton.vue';

const { close, openFromHere: go } = useReturnTo();
</script>

<template>
  <ModalShell title="Menu" title-id="menu-title" @close="close">
    <nav class="menu" aria-label="Menu">
      <AppButton @click="go('stats')">STATS</AppButton>
      <AppButton @click="go('how-to-play')">HOW TO PLAY</AppButton>
      <AppButton @click="go('about')">ABOUT</AppButton>
      <AppButton @click="go('reset')">RESET</AppButton>
    </nav>
    <p class="menu__hint t-label t-label--lc muted">Esc also opens and closes this menu</p>
  </ModalShell>
</template>

<style scoped>
.menu { display: flex; flex-direction: column; gap: 3.2rem; }
.menu__hint { text-align: center; margin-top: 4.8rem; }
</style>
