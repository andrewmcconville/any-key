<script setup>
import EraDots from './EraDots.vue';
</script>

<template>
  <nav class="hud-bottom" aria-label="Eras">
    <EraDots />
  </nav>
</template>

<style scoped>
.hud-bottom {
  flex: 0 0 19.2rem;
  height: 19.2rem;
  width: 100%;
  max-width: var(--phone-w);
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4.8rem;
  background: #efefef;
  border-top: 0.2rem solid var(--line-soft);
  z-index: 3;
}
</style>
