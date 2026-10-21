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
  flex: 0 0 auto;
  height: calc(19.2rem + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);   /* keeps the era dots above the phone's gesture bar */
  width: 100%;
  max-width: var(--phone-w);
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: calc(4.8rem + var(--safe-left)) calc(4.8rem + var(--safe-right));
  background: #efefef;
  border-top: 0.2rem solid var(--line-soft);
  z-index: 3;
}
</style>
