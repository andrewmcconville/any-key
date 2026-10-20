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
  <ModalShell variant="completion" :closable="false">
    <p class="t-display">{{ game.total }} / {{ game.total }}</p>
    <h2 class="t-heading" id="modal-title">{{ COPY.completion.heading }}</h2>
    <p class="ach-line t-label t-label--lc">{{ COPY.completion.achievement }}</p>
    <p class="t-body">{{ COPY.completion.body }}</p>
    <AppButton @click="router.replace({ name: 'stats' })">VIEW STATS</AppButton>
    <AppButton @click="startOver">START OVER</AppButton>
  </ModalShell>
</template>
