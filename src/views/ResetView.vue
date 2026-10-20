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
const close = () => router.replace({ path: '/' });

function confirm() {
  game.reset();
  ui.hideToast();
  router.replace({ path: '/' }).then(() => ui.scrollToEra(1));
}
</script>

<template>
  <ModalShell variant="reset" @close="close">
    <h2 class="t-title" id="modal-title">{{ COPY.reset.title }}</h2>
    <p class="t-body">{{ COPY.reset.body }}</p>
    <div class="reset__buttons">
      <AppButton solid @click="close">CANCEL</AppButton>
      <AppButton @click="confirm">RESET</AppButton>
    </div>
  </ModalShell>
</template>
