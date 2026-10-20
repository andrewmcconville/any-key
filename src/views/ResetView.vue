<script setup>
import { useRouter } from 'vue-router';
import { useReturnTo } from '../composables/useReturnTo';
import { COPY } from '../data/content';
import { useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';
import ModalShell from '../components/ModalShell.vue';
import AppButton from '../components/AppButton.vue';

const game = useGameStore();
const ui = useUiStore();
const router = useRouter();
const { close } = useReturnTo();

function confirm() {
  game.reset();
  ui.hideToast();
  router.replace({ path: '/' }).then(() => ui.scrollToEra(1));
}
</script>

<template>
  <ModalShell width="112rem" align="center" padding="8rem" role="alertdialog" @close="close">
    <h2 class="title t-title" id="modal-title">{{ COPY.reset.title }}</h2>
    <p class="body t-body">{{ COPY.reset.body }}</p>
    <div class="buttons">
      <AppButton solid @click="close">CANCEL</AppButton>
      <AppButton @click="confirm">RESET</AppButton>
    </div>
  </ModalShell>
</template>

<style scoped>
.title { margin-bottom: 4rem; }
.body { color: var(--muted); margin-bottom: 8rem; white-space: pre-line; }
.buttons { display: flex; gap: 3.6rem; }
.buttons .btn { height: 17rem; }
</style>
