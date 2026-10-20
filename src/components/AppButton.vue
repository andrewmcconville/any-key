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
