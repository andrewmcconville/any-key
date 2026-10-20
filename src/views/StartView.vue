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
