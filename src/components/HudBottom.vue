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
  /* Inset from the stage edges by --hud-gutter; the border runs down both sides and along the top. */
  width: calc(min(100%, var(--phone-w)) - 2 * var(--hud-gutter));
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: calc(4.8rem + var(--safe-left)) calc(4.8rem + var(--safe-right));
  background: var(--bar);
  border: var(--hairline) solid var(--line-soft);
  border-bottom: 0;
  z-index: 3;
}
</style>
