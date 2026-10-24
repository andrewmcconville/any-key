<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { COPY } from '../data/content';
import { useGameStore } from '../stores/game';
import AppButton from '../components/AppButton.vue';

const game = useGameStore();
const router = useRouter();

function start() {
  game.start();
  router.replace({ path: '/' });
}

// "Press any key" means any key: a physical keyboard works too.
function onKey(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  e.preventDefault();
  start();
}
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="layer layer--start">
    <div class="start" @click="start">
      <h1 class="start__title t-display">{{ COPY.start.title }}</h1>
      <p class="start__sub t-body">{{ COPY.start.sub }}</p>
      <AppButton class="start__btn" keycap>{{ COPY.start.button }}</AppButton>
      <p class="start__cap t-body">{{ COPY.start.caption }}</p>
    </div>
  </div>
</template>

<style scoped>
.layer--start { background: oklch(0.269 0 0 / 0.85); }
/* The start screen fills the 144 × 256 phone frame; its words sit in a column at the frame's
   centre, with the Figma overlay's spacing between them. */
.start {
  width: 144rem; height: 256rem;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--white);
  text-align: center;
  cursor: pointer;
}
/* Margins set outright: the h1 and p defaults would push the visible block off centre. */
.start__title { width: 120rem; margin: 0 0 8rem; color: var(--white); }
.start__sub   { width: 112rem; margin: 0 0 18rem; }
.start__btn   { width: 90rem; margin: 0 0 11rem; }
.start__cap   { width: 112rem; margin: 0; }
.start .btn--keycap { background: var(--white); color: var(--ink); border-color: var(--ink); }
</style>
