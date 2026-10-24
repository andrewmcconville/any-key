<script setup>
// One button for every modal action. `keycap` adds the offset "key" shadow used for the two press moments.
defineProps({
  solid: { type: Boolean, default: false },
  keycap: { type: Boolean, default: false },
});
</script>

<template>
  <button class="btn" :class="{ 'btn--solid': solid, 'btn--keycap': keycap }" type="button">
    <slot />
  </button>
</template>

<style scoped>
.btn {
  width: 100%;
  height: 16.8rem;   /* two heights on the 2.4rem grid: this, and the keycap's 19.2rem */
  border-radius: var(--radius);
  border: var(--stroke) solid var(--ink);
  background: var(--white);
  color: var(--ink);
  font: 700 var(--text-button)/var(--lh-button) var(--font-display);
  text-transform: uppercase;
  display: grid; place-items: center;
  transition: transform var(--dur-xs) var(--ease-standard), background var(--dur-sm) var(--ease-standard), color var(--dur-sm) var(--ease-standard), box-shadow var(--dur-xs) var(--ease-standard);
}
.btn:active { transform: translateY(0.4rem); }
.btn--solid { background: var(--ink); color: var(--white); }
/* Keycap: the offset shadow is the "key" look; pressing drops the cap onto it. */
.btn--keycap {
  height: 19.2rem;
  box-shadow: 0 1.2rem 0 var(--ink);
  margin-bottom: 1.2rem;
}
.btn--keycap:active { transform: translateY(1.2rem); box-shadow: 0 0 0 var(--ink); }
.btn--keycap.btn--solid { box-shadow: none; }
.btn--keycap.btn--solid:active { transform: none; }
</style>
