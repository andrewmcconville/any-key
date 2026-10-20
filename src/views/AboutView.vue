<script setup>
import { useRouter } from 'vue-router';
import { COPY } from '../data/content';
import ModalShell from '../components/ModalShell.vue';
import AppButton from '../components/AppButton.vue';

const router = useRouter();
const close = () => router.replace({ path: '/' });
const about = COPY.about;
</script>

<template>
  <ModalShell title="About & Sources" title-id="about-title" @close="close">
    <div class="section"><p class="t-label">About this collection</p><p class="t-body">{{ about.about }}</p></div>
    <div class="section"><p class="t-label">Made by</p><p class="t-body">{{ about.madeBy }}</p></div>
    <div class="section">
      <p class="t-label">Sources</p>
      <div class="bullets t-body muted"><p v-for="s in about.sources" :key="s">• {{ s }}</p></div>
    </div>
    <div class="section">
      <p class="t-label">Figma plugins &amp; tools</p>
      <div class="bullets t-body muted"><p v-for="s in about.tools" :key="s">• {{ s }}</p></div>
    </div>
    <template #footer><AppButton @click="close">CLOSE</AppButton></template>
  </ModalShell>
</template>

<style scoped>
.bullets { padding-left: 2.4rem; text-indent: -2.4rem; }
.bullets p { margin: 0 0 1.2rem; }
</style>
