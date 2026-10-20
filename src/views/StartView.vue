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
.layer--start { background: rgba(38,38,38,.85); }
/* The start screen is laid out on the 144 × 256 phone frame, like the Figma overlay. */
.start {
  width: 144rem; height: 256rem;
  position: relative;
  color: var(--white);
  text-align: center;
  cursor: pointer;
}
.start__title { position: absolute; left: 12rem; width: 120rem; top: 134rem; color: var(--white); }
.start__sub   { position: absolute; left: 16rem; width: 112rem; top: 158rem; }
.start__btn   { position: absolute; left: 27rem; width: 90rem; top: 190rem; }
.start__cap   { position: absolute; left: 16rem; width: 112rem; top: 218rem; }
.start .btn--keycap { background: var(--white); color: var(--ink); border-color: var(--ink); }
</style>
