<script setup>
import { useUiStore } from '../stores/ui';
const ui = useUiStore();
</script>

<template>
  <button
    class="toast t-heading"
    type="button"
    :data-open="ui.toast.open"
    aria-live="assertive"
    @click="ui.dismissToast()"
  >{{ ui.toast.text }}</button>
</template>

<style scoped>
.toast {
  position: absolute;
  left: calc(50% - 60rem); width: 120rem; height: 18rem;
  top: calc(21.6rem + var(--safe-top));
  z-index: 20;            /* above overlays (10): it announces an unlock as the key modal fades out */
  border-radius: var(--radius-lg);
  background: var(--ink); color: var(--white);
  display: grid; place-items: center;
  text-align: center;
  transform: translateY(-4rem); opacity: 0; pointer-events: none;
  transition: transform var(--dur-md) var(--ease-standard), opacity var(--dur-md) var(--ease-standard);
}
.toast[data-open="true"] { transform: none; opacity: 1; pointer-events: auto; }
</style>
