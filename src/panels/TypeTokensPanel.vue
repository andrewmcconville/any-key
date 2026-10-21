<script setup>
import { computed } from 'vue';
import FloatingPanel from '../components/FloatingPanel.vue';
import { TYPE_TOKENS, useTokensStore } from '../stores/tokens';

const tokens = useTokensStore();

// 1rem in CSS px on this screen, so the readout can show what the visitor actually sees.
const remPx = computed(() => parseFloat(getComputedStyle(document.documentElement).fontSize) || 0);
const px = rem => (rem * remPx.value).toFixed(1);
</script>

<template>
  <FloatingPanel id="type-tokens" title="Type tokens">
    <div v-for="t in TYPE_TOKENS" :key="t.id" class="token">
      <div class="token__head">
        <span class="token__sample" :class="t.sample">{{ t.label }}</span>
        <span class="token__value t-label t-label--lc">
          {{ tokens.sizes[t.id] }}rem · {{ px(tokens.sizes[t.id]) }}px
          <button v-if="!tokens.isDefault(t.id)" class="token__reset" type="button" @click="tokens.set(t.id, t.size)">reset</button>
        </span>
      </div>
      <input
        class="token__slider"
        type="range"
        :min="t.min"
        :max="t.max"
        step="0.1"
        :value="tokens.sizes[t.id]"
        :aria-label="`${t.label} size`"
        @input="tokens.set(t.id, $event.target.value)"
      >
    </div>
    <button class="reset-all t-label" type="button" @click="tokens.reset()">Reset all to defaults</button>
  </FloatingPanel>
</template>

<style scoped>
.token { margin-bottom: 3.2rem; }
.token__head { display: flex; align-items: baseline; justify-content: space-between; gap: 2.4rem; margin-bottom: 0.8rem; }
.token__sample { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.token__value { color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.token__reset {
  margin-left: 1.2rem;
  color: var(--ink);
  text-decoration: underline;
  font: inherit;
}
.token__slider {
  display: block;
  width: 100%;
  height: 8.8rem;         /* comfortable touch target; the track itself is thin */
  margin: 0;
  accent-color: var(--ink);
  touch-action: pan-y;
}
.reset-all {
  width: 100%;
  height: 11.2rem;
  border: var(--stroke) solid var(--ink);
  border-radius: 1.6rem;
  background: var(--white);
}
</style>
