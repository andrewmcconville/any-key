<script setup>
import { useReturnTo } from '../composables/useReturnTo';
import { COPY } from '../data/content';
import ModalShell from '../components/ModalShell.vue';
import AppButton from '../components/AppButton.vue';

const { close } = useReturnTo();
</script>

<template>
  <ModalShell title="How to play" title-id="howto-title" @close="close">
    <div v-for="(step, i) in COPY.howTo" :key="i" class="step">
      <div class="step__badge">{{ i + 1 }}</div>
      <div class="step__text">
        <p class="t-heading">{{ step.h }}</p>
        <p class="t-body muted">{{ step.p }}</p>
      </div>
    </div>
    <template #footer><AppButton @click="close">GOT IT</AppButton></template>
  </ModalShell>
</template>

<style scoped>
.step { display: flex; gap: 4rem; margin-bottom: 4.8rem; }
.step__badge {
  width: 10rem; height: 10rem; border-radius: 50%; flex: 0 0 auto;
  background: var(--ink); color: var(--white);
  display: grid; place-items: center;
  font: 700 4.4rem/1 var(--font-display);
}
.step__text .t-heading { margin-bottom: 0.8rem; }
</style>
