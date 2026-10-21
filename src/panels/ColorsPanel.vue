<script setup>
import { ref } from 'vue';
import FloatingPanel from '../components/FloatingPanel.vue';
import { CHANNELS, COLOR_TOKENS, useColorsStore } from '../stores/colors';

const colors = useColorsStore();

const fmt = (ch, v) => (ch.key === 'h' ? `${Math.round(v)}°` : v.toFixed(ch.dp));

function snapshot() {
  const lines = COLOR_TOKENS.map(t =>
    `  --${t.id}: ${colors.css(t.id)};   /* ${colors.hex(t.id)}${colors.isDefault(t.id) ? '' : ', changed'} */`);
  return ['/* Any Key colour tokens (OKLCH; nearest sRGB hex in comments) */', ':root {', ...lines, '}'].join('\n');
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
      <div class="swatch__row">
        <span class="swatch__chip" :style="{ background: colors.css(t.id) }" aria-hidden="true" />
        <span class="swatch__name t-strong">{{ t.label }}</span>
        <span class="swatch__value t-label t-label--lc">
          {{ colors.hex(t.id) }}
          <button v-if="!colors.isDefault(t.id)" class="swatch__reset" type="button" @click="colors.resetOne(t.id)">reset</button>
        </span>
      </div>
      <div class="swatch__note t-label t-label--lc muted">{{ t.note }}</div>

      <label v-for="ch in CHANNELS" :key="ch.key" class="channel">
        <span class="channel__key t-label">{{ ch.label }}</span>
        <input
          class="channel__slider"
          :class="`channel__slider--${ch.key}`"
          type="range"
          :min="ch.min" :max="ch.max" :step="ch.step"
          :value="colors.values[t.id][ch.key]"
          :aria-label="`${t.label} ${ch.label}`"
          @input="colors.setChannel(t.id, ch.key, $event.target.value)"
        >
        <span class="channel__value t-label t-label--lc">{{ fmt(ch, colors.values[t.id][ch.key]) }}</span>
      </label>
      <label v-if="t.alpha != null" class="channel">
        <span class="channel__key t-label">A</span>
        <input
          class="channel__slider"
          type="range" min="0" max="1" step="0.01"
          :value="colors.values[t.id].alpha"
          :aria-label="`${t.label} opacity`"
          @input="colors.setAlpha(t.id, $event.target.value)"
        >
        <span class="channel__value t-label t-label--lc">{{ Math.round(colors.values[t.id].alpha * 100) }}%</span>
      </label>
    </div>

    <div class="actions">
      <button class="action t-label" type="button" @click="copy">{{ copied ? 'Copied' : 'Copy values' }}</button>
      <button class="action t-label" type="button" @click="colors.reset()">Reset all</button>
    </div>
  </FloatingPanel>
</template>

<style scoped>
.swatch { margin-bottom: 3.2rem; }
.swatch__row { display: flex; align-items: center; gap: 1.6rem; }
.swatch__chip {
  flex: 0 0 auto;
  width: 6.4rem; height: 6.4rem;
  border-radius: 1.2rem;
  border: 0.3rem solid var(--ink);
}
.swatch__name { flex: 1 1 auto; }
.swatch__value { color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.swatch__reset { margin-left: 1.2rem; color: var(--ink); text-decoration: underline; font: inherit; }
.swatch__note { margin: 0.4rem 0 0.8rem; }
.channel { display: grid; grid-template-columns: 3.2rem 1fr 8.8rem; align-items: center; gap: 1.6rem; }
.channel__key { color: var(--muted); }
.channel__slider {
  width: 100%;
  height: 6.4rem;
  margin: 0;
  accent-color: var(--ink);
  touch-action: pan-y;
}
.channel__value { color: var(--muted); text-align: right; font-variant-numeric: tabular-nums; }
.actions { display: flex; gap: 2.4rem; margin-top: 1.6rem; }
.action {
  flex: 1 1 0;
  height: 11.2rem;
  border: var(--stroke) solid var(--ink);
  border-radius: 1.6rem;
  background: var(--white);
}
</style>
