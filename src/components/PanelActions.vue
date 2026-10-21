<script setup>
import { useCopyText } from '../composables/useCopyText';

/** The Copy values / Reset all bar at the foot of a design-tool panel. */
const props = defineProps({
  /** Returns the text to copy, built when the button is pressed. */
  snapshot: { type: Function, required: true },
});
const emit = defineEmits(['reset']);
const { copied, copy } = useCopyText();
</script>

<template>
  <div class="actions">
    <button class="action t-label" type="button" @click="copy(props.snapshot())">{{ copied ? 'Copied' : 'Copy values' }}</button>
    <button class="action t-label" type="button" @click="emit('reset')">Reset all</button>
  </div>
</template>

<style scoped>
.actions { display: flex; gap: 2.4rem; margin-top: 1.6rem; }
.action {
  flex: 1 1 0;
  height: 11.2rem;
  border: var(--stroke) solid var(--ink);
  border-radius: var(--radius-sm);
  background: var(--white);
}
</style>
