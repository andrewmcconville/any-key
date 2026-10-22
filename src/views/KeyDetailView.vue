<script setup>
import { computed, onUnmounted, ref } from 'vue';
import { useOverlayNav } from '../composables/useOverlayNav';
import { COPY } from '../data/content';
import { useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';
import ModalShell from '../components/ModalShell.vue';
import AppButton from '../components/AppButton.vue';

const props = defineProps({ id: { type: String, required: true } });
const game = useGameStore();
const ui = useUiStore();
const nav = useOverlayNav();

const key = computed(() => game.keyById(props.id));
const era = computed(() => game.eraById(key.value.era));
const collected = computed(() => game.isCollected(props.id));
const justCollected = ref(false);

const titleCase = s => s.charAt(0) + s.slice(1).toLowerCase();
const meta = computed(() => `${key.value.year} · Era ${era.value.numeral} · ${titleCase(era.value.name)} · Feedback: ${key.value.feedback}`);
const caption = computed(() => {
  if (!collected.value) return COPY.collectCaption;
  return justCollected.value ? game.collectedCaption(key.value) : 'Collected · tap to go back to the timeline';
});

// Pressing collects and goes back to the board after a beat, long enough to see the key turn ✓;
// the consequences (toast, completion) land on close. A collected key's button just goes back.
const COLLECT_BEAT_MS = 600;
let closing = null;
function onCollect() {
  if (collected.value) { close(); return; }
  game.collect(props.id);
  justCollected.value = true;
  closing = setTimeout(close, COLLECT_BEAT_MS);
}
onUnmounted(() => clearTimeout(closing));

// Closing is where the consequences land: the completion screen, or the era-unlock toast.
async function close() {
  if (game.isComplete && !game.completionShown) {
    game.markCompletionShown();
    game.consumePendingUnlock();
    nav.swap('complete');   // takes this entry's place at the same depth; Start over unwinds to the board
    return;
  }
  const unlockedEra = game.consumePendingUnlock();
  await nav.close();
  if (unlockedEra) {
    const e = game.eraById(unlockedEra);
    ui.showToast(`ERA ${e.numeral} · ${e.name} UNLOCKED`, e.id);
  }
}
</script>

<template>
  <ModalShell v-if="key" :title="key.title ?? key.name" title-id="key-title" @close="close">
    <p class="meta t-label t-label--lc">{{ meta }}</p>
    <div class="image t-label t-label--lc">IMAGE — {{ key.image }}</div>
    <div class="section"><p class="t-label">What the press does</p><p class="t-body">{{ key.press }}</p></div>
    <div class="section"><p class="t-label">Description</p><p class="t-body">{{ key.description }}</p></div>
    <div class="section"><p class="t-label">Why it belongs</p><p class="t-body">{{ key.why }}</p></div>

    <template #footer>
      <AppButton keycap :solid="collected" @click="onCollect">
        {{ collected ? '✓  COLLECTED' : 'PRESS TO COLLECT' }}
      </AppButton>
      <p class="btn-caption t-label t-label--lc">{{ caption }}</p>
    </template>
  </ModalShell>
</template>

<style scoped>
.meta { color: var(--muted); margin-bottom: 4.8rem; }
.image {
  width: 120rem; height: 32rem;     /* shorter than the Figma 402 to give the larger type its room */
  background: var(--fill-soft);
  border-radius: var(--radius-xs);
  display: grid; place-items: center;
  text-align: center;
  padding: 0 4.8rem;
  color: var(--muted);
  margin-bottom: 4.8rem;
}
.btn-caption { text-align: center; color: var(--muted); margin-top: 2.4rem; }
</style>
