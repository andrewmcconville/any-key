<script setup>
import { useRouter } from 'vue-router';
import { COPY } from '../data/content';
import { useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';
import ModalShell from '../components/ModalShell.vue';
import AppButton from '../components/AppButton.vue';

const game = useGameStore();
const ui = useUiStore();
const router = useRouter();

function startOver() {
  game.reset();
  router.replace({ path: '/' }).then(() => ui.scrollToEra(1));
}
</script>

<template>
  <ModalShell width="120rem" align="center" padding="8.2rem 4.8rem 6rem" :closable="false">
    <p class="count t-display">{{ game.total }} / {{ game.total }}</p>
    <h2 class="heading t-heading" id="modal-title">{{ COPY.completion.heading }}</h2>
    <p class="ach-line t-label t-label--lc">{{ COPY.completion.achievement }}</p>
    <p class="body t-body">{{ COPY.completion.body }}</p>
    <AppButton @click="router.replace({ name: 'stats' })">VIEW STATS</AppButton>
    <AppButton @click="startOver">START OVER</AppButton>
  </ModalShell>
</template>

<style scoped>
.count { margin-bottom: 4rem; }
.heading { margin-bottom: 2.4rem; }
.ach-line { color: var(--muted); margin-bottom: 4rem; }
.body { color: var(--muted); margin-bottom: 9.6rem; }
.btn + .btn { margin-top: 3.2rem; }
</style>
