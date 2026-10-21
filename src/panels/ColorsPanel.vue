<script setup>
import { ref } from 'vue';
import FloatingPanel from '../components/FloatingPanel.vue';
import { COLOR_TOKENS, useColorsStore } from '../stores/colors';

const colors = useColorsStore();

function snapshot() {
  const lines = COLOR_TOKENS.map(t => `  --${t.id}: ${colors.css(t.id)};${colors.isDefault(t.id) ? '' : '   /* changed */'}`);
  return ['/* Any Key colour tokens */', ':root {', ...lines, '}'].join('\n');
}

const copied = ref(false);
async function copy() {
  const text = snapshot();
  try {
    await navigator.clipboard.writeText(text);
  } catch (_) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 1500);
}
</script>

<template>
  <FloatingPanel id="colors" title="Colours">
    <div v-for="t in COLOR_TOKENS" :key="t.id" class="swatch">
      <label class="swatch__chip" :style="{ background: colors.css(t.id) }">
        <input
          type="color"
          :value="colors.values[t.id].hex"
          :aria-label="`${t.label} colour`"
          @input="colors.setHex(t.id, $event.target.value)"
        >
      </label>
      <div class="swatch__text">
        <div class="swatch__row">
          <span class="swatch__name t-strong">{{ t.label }}</span>
          <span class="swatch__value t-label t-label--lc">
            {{ colors.values[t.id].hex }}<template v-if="t.alpha != null"> · {{ Math.round(colors.values[t.id].alpha * 100) }}%</template>
            <button v-if="!colors.isDefault(t.id)" class="swatch__reset" type="button" @click="colors.resetOne(t.id)">reset</button>
          </span>
        </div>
        <div class="swatch__note t-label t-label--lc muted">{{ t.note }}</div>
        <input
          v-if="t.alpha != null"
          class="swatch__alpha"
          type="range" min="0" max="1" step="0.01"
          :value="colors.values[t.id].alpha"
          :aria-label="`${t.label} opacity`"
          @input="colors.setAlpha(t.id, $event.target.value)"
        >
      </div>
    </div>
    <div class="actions">
      <button class="action t-label" type="button" @click="copy">{{ copied ? 'Copied' : 'Copy values' }}</button>
      <button class="action t-label" type="button" @click="colors.reset()">Reset all</button>
    </div>
  </FloatingPanel>
</template>

<style scoped>
.swatch { display: flex; align-items: flex-start; gap: 2.4rem; margin-bottom: 2.4rem; }
/* The chip is the picker: the native colour input sits inside it, invisible but tappable. */
.swatch__chip {
  position: relative; flex: 0 0 auto;
  width: 11.2rem; height: 11.2rem;
  border-radius: 1.6rem;
  border: var(--stroke) solid var(--ink);
  overflow: hidden;
  cursor: pointer;
}
.swatch__chip input { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.swatch__text { flex: 1 1 0; min-width: 0; }
.swatch__row { display: flex; align-items: baseline; justify-content: space-between; gap: 1.6rem; }
.swatch__value { color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.swatch__reset { margin-left: 1.2rem; color: var(--ink); text-decoration: underline; font: inherit; }
.swatch__alpha { display: block; width: 100%; height: 6.4rem; margin: 0.8rem 0 0; accent-color: var(--ink); touch-action: pan-y; }
.actions { display: flex; gap: 2.4rem; margin-top: 3.2rem; }
.action {
  flex: 1 1 0;
  height: 11.2rem;
  border: var(--stroke) solid var(--ink);
  border-radius: 1.6rem;
  background: var(--white);
}
</style>
