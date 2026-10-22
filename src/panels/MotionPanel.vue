<script setup>
import EasingEditor from '../components/EasingEditor.vue';
import FloatingPanel from '../components/FloatingPanel.vue';
import PanelActions from '../components/PanelActions.vue';
import { replayAll } from '../lib/replay';
import { DURATION_RANGE, DURATION_TOKENS, EASING_TOKENS, useMotionStore } from '../stores/motion';

const motion = useMotionStore();

// The values as they belong in styles.css.
function snapshot() {
  const d = DURATION_TOKENS.map(t => `  --${t.id}: ${motion.durations[t.id]}s;${motion.isDefault(t.id) ? '' : '   /* changed */'}`);
  const e = EASING_TOKENS.map(t => `  --${t.id}: ${motion.easingCss(t.id)};${motion.isDefault(t.id) ? '' : '   /* changed */'}`);
  return ['/* Any Key motion tokens */', ':root {', ...d, ...e, '}'].join('\n');
}
</script>

<template>
  <FloatingPanel id="motion" title="Motion" width="112rem" :play="replayAll">
    <section class="group">
      <h3 class="group__title t-label muted">Durations</h3>
      <div v-for="t in DURATION_TOKENS" :key="t.id" class="token">
        <div class="token__head">
          <span class="token__text">
            <span class="token__name t-strong">{{ t.label }}</span>
            <span class="token__note t-label t-label--lc muted">{{ t.note }}</span>
          </span>
          <span class="token__value t-label t-label--lc">
            {{ motion.ms(t.id) }}ms
            <button v-if="!motion.isDefault(t.id)" class="token__reset" type="button" @click="motion.resetOne(t.id)">reset</button>
          </span>
        </div>
        <input
          class="token__slider"
          type="range"
          :min="DURATION_RANGE.min" :max="DURATION_RANGE.max" :step="DURATION_RANGE.step"
          :value="motion.durations[t.id]"
          :aria-label="`${t.label} duration`"
          @input="motion.setDuration(t.id, $event.target.value)"
        >
      </div>
    </section>
    <section class="group">
      <h3 class="group__title t-label muted">Easings</h3>
      <div v-for="t in EASING_TOKENS" :key="t.id" class="token token--easing">
        <div class="token__head">
          <span class="token__text">
            <span class="token__name t-strong">{{ t.label }}</span>
            <span class="token__note t-label t-label--lc muted">{{ t.note }}</span>
          </span>
          <span class="token__value t-label t-label--lc">
            <button v-if="!motion.isDefault(t.id)" class="token__reset" type="button" @click="motion.resetOne(t.id)">reset</button>
          </span>
        </div>
        <EasingEditor :id="t.id" />
      </div>
    </section>
    <template #footer><PanelActions :snapshot="snapshot" @reset="motion.reset()" /></template>
  </FloatingPanel>
</template>

<style scoped>
.group { margin-bottom: 2.4rem; }
.group__title { margin: 0 0 1.6rem; }
.token { margin-bottom: 2.4rem; }
.token--easing { margin-bottom: 4rem; }
.token__head { display: flex; align-items: center; justify-content: space-between; gap: 2rem; margin-bottom: 0.8rem; }
.token__text { display: flex; flex-direction: column; min-width: 0; }
.token__note { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.token__value { color: var(--muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.token__reset { margin-left: 1.2rem; color: var(--ink); text-decoration: underline; font: inherit; }
.token__slider { display: block; width: 100%; height: 6.4rem; margin: 0; accent-color: var(--ink); touch-action: pan-y; }
</style>
