<script setup>
import { useRouter } from 'vue-router';
import { COPY } from '../data/content';
import ModalShell from '../components/ModalShell.vue';
import AppButton from '../components/AppButton.vue';

const router = useRouter();
const close = () => router.replace({ path: '/' });
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
