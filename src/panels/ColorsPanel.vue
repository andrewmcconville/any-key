<script setup>
import { ref } from 'vue';
import FloatingPanel from '../components/FloatingPanel.vue';
import PanelActions from '../components/PanelActions.vue';
import { CHANNELS, COLOR_TOKENS, useColorsStore } from '../stores/colors';

const colors = useColorsStore();

// Which token's sliders are showing; tapping a swatch row toggles it, one open at a time.
const openId = ref(null);
const toggle = id => { openId.value = openId.value === id ? null : id; };

const fmt = (ch, v) => (ch.key === 'h' ? `${Math.round(v)}°` : v.toFixed(ch.dp));

function snapshot() {
  const lines = COLOR_TOKENS.map(t =>
    `  --${t.id}: ${colors.css(t.id)};   /* ${colors.hex(t.id)}${colors.isDefault(t.id) ? '' : ', changed'} */`);
  return ['/* Any Key colour tokens (OKLCH; nearest sRGB hex in comments) */', ':root {', ...lines, '}'].join('\n');
}

</script>

<template>
  <FloatingPanel id="colors" title="Colours">
    <div v-for="t in COLOR_TOKENS" :key="t.id" class="swatch" :class="{ 'swatch--open': openId === t.id }">
      <button
        class="swatch__row"
        type="button"
        :aria-expanded="openId === t.id"
        :aria-controls="`channels-${t.id}`"
        @click="toggle(t.id)"
      >
        <span class="swatch__chip" :style="{ background: colors.css(t.id) }" aria-hidden="true" />
        <span class="swatch__text">
          <span class="swatch__name t-strong">{{ t.label }}</span>
          <span class="swatch__note t-label t-label--lc muted">{{ t.note }}</span>
        </span>
        <span class="swatch__value t-label t-label--lc">{{ colors.hex(t.id) }}</span>
        <svg class="swatch__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>

      <div v-show="openId === t.id" :id="`channels-${t.id}`" class="channels">
      <button v-if="!colors.isDefault(t.id)" class="swatch__reset t-label t-label--lc" type="button" @click="colors.resetOne(t.id)">Reset {{ t.label }}</button>
      <label v-for="ch in CHANNELS" :key="ch.key" class="channel">
        <span class="channel__key t-label">{{ ch.label }}</span>
        <input
          class="channel__slider"
          type="range"
          :min="ch.min" :max="ch.max" :step="ch.step"
          :value="colors.values[t.id][ch.key]"
          :aria-label="`${t.label} ${ch.label}`"
          @input="colors.setChannel(t.id, ch.key, $event.target.value)"
        >
        <span class="channel__value t-label t-label--lc">{{ fmt(ch, colors.values[t.id][ch.key]) }}</span>
      </label>
      <label v-if="t.hasAlpha" class="channel">
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
    </div>

    <PanelActions :snapshot="snapshot" @reset="colors.reset()" />
  </FloatingPanel>
</template>

<style scoped>
.swatch { border-bottom: 0.2rem solid var(--line-soft); }
.swatch:last-of-type { border-bottom: 0; }
/* The whole row is the toggle: a full-width tap target that reveals the sliders beneath it. */
.swatch__row {
  width: 100%;
  min-height: 14.4rem;
  display: flex; align-items: center; gap: 2rem;
  padding: 1.6rem 0;
  text-align: left;
}
.swatch__chip {
  flex: 0 0 auto;
  width: 8rem; height: 8rem;
  border-radius: 1.6rem;
  border: 0.3rem solid var(--ink);
}
.swatch__text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.swatch__note { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.swatch__value { color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.swatch__chevron {
  flex: 0 0 auto;
  width: 4rem; height: 4rem;
  stroke: var(--muted); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; fill: none;
  transition: transform .2s;
}
.swatch--open .swatch__chevron { transform: rotate(180deg); }
.channels { padding: 0 0 2rem; }
.swatch__reset { display: block; margin: 0 0 1.2rem auto; color: var(--ink); text-decoration: underline; }
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
</style>
