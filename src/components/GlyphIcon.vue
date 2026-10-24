<script setup>
// The ✓ and ? marks, drawn like the × (CloseButton) instead of set as text: the fonts have no ✓,
// so the text one fell back to whatever symbol font the device had. 1em square, so each place sizes
// it with font-size, and drawn in currentColor.
defineProps({ name: { type: String, required: true } });   // 'check' | 'question'
</script>

<template>
  <svg class="glyph-icon" viewBox="0 0 56 56" aria-hidden="true">
    <path v-if="name === 'check'" d="M11 29l11 11 23-24" />
    <template v-else>
      <path d="M20 20a8 8 0 1 1 11.25 7.3c-2.3 1.1-3.25 2.9-3.25 5.2v2" />
      <circle cx="28" cy="43.5" r="3.5" />
    </template>
  </svg>
</template>

<style scoped>
.glyph-icon {
  width: 1em; height: 1em; flex: 0 0 auto;
  fill: none; stroke: currentColor; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round;
}
.glyph-icon circle { fill: currentColor; stroke: none; }
</style>
