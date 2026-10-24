<script setup>
import { computed, onUnmounted, ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useOverlayNav } from '../composables/useOverlayNav';
import { COPY, IMAGE_SOURCES } from '../data/content';
import { useFlightStore } from '../stores/flight';
import { useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';
import ModalShell from '../components/ModalShell.vue';
import AppButton from '../components/AppButton.vue';

const props = defineProps({ id: { type: String, required: true } });
const game = useGameStore();
const ui = useUiStore();
const flight = useFlightStore();
const nav = useOverlayNav();

const key = computed(() => game.keyById(props.id));
const era = computed(() => game.eraById(key.value.era));
const collected = computed(() => game.isCollected(props.id));
const justCollected = ref(false);
const collectBtn = ref(null);

// Who made the key's picture on the timeline, if it has one (see IMAGE_SOURCES).
const imageSource = computed(() => (key.value.photo ? IMAGE_SOURCES[key.value.photoSource] ?? null : null));

const titleCase = s => s.charAt(0) + s.slice(1).toLowerCase();
const meta = computed(() => `${key.value.year} · Era ${era.value.numeral} · ${titleCase(era.value.name)} · Feedback: ${key.value.feedback}`);
const caption = computed(() => {
  if (!collected.value) return COPY.collectCaption;
  return justCollected.value ? game.collectedCaption(key.value) : 'Collected · tap to go back to the timeline';
});

// Pressing collects and goes back to the board after a beat (a knob in the flight store), long
// enough to see the key turn ✓; the consequences (toast, completion) land on close. A collected
// key's button just goes back.
//
// The rule for anything added to this card later: the card closes on its own a beat after the
// collect, so an in-card payoff (a demo, a sound, a reveal) plays when the card opens, or is
// replayed from a collected card, never in the moment after the press.
let closing = null;
let closed = false;
function onCollect() {
  if (collected.value) { close(); return; }
  // The cap lifts off the button towards the HUD gauge; the gauge counts it when it lands.
  const el = collectBtn.value?.$el;
  if (el) ui.launchFlight(el.getBoundingClientRect(), key.value.legend ?? key.value.name, game.count);
  game.collect(props.id);
  justCollected.value = true;
  closing = setTimeout(close, flight.settings.beat);
}
onUnmounted(() => clearTimeout(closing));
// Leaving by any other way (the browser's back, a link) cancels the pending auto-close too.
onBeforeRouteLeave(() => { clearTimeout(closing); });

// Closing is where the consequences land: the completion screen, or the era-unlock toast.
// It runs once: a tap on × or ✓, or Esc, during the collect beat closes the card, and the beat's
// own timer must not close it a second time. The card stays mounted while it fades out, so a
// second close would go back from whatever replaced it (on the 14th key, the Completion screen).
async function close() {
  if (closed) return;
  closed = true;
  clearTimeout(closing);
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
    ui.showToast({ text: `ERA ${e.numeral} · ${e.name} UNLOCKED`, eraId: e.id });   // waits for the cap to land
  }
}
</script>

<template>
  <ModalShell v-if="key" :title="key.title ?? key.short ?? key.name" title-id="key-title" @close="close">
    <p class="meta t-label t-label--lc">{{ meta }}</p>
    <figure class="figure">
      <div class="image t-label t-label--lc">IMAGE — {{ key.image }}</div>
      <figcaption v-if="imageSource" class="credit t-label t-label--lc">
        Timeline picture: {{ imageSource.credit }}.{{ imageSource.generated ? ' An illustration, not a photograph of the object.' : '' }}
      </figcaption>
    </figure>
    <div class="section"><p class="t-label">What the press does</p><p class="t-body">{{ key.press }}</p></div>
    <div class="section"><p class="t-label">Description</p><p class="t-body">{{ key.description }}</p></div>
    <div class="section"><p class="t-label">Why it belongs</p><p class="t-body">{{ key.why }}</p></div>

    <template #footer>
      <AppButton ref="collectBtn" keycap :solid="collected" @click="onCollect">
        {{ collected ? '✓  COLLECTED' : 'PRESS TO COLLECT' }}
      </AppButton>
      <p class="btn-caption t-label t-label--lc">{{ caption }}</p>
    </template>
  </ModalShell>
</template>

<style scoped>
.meta { color: var(--muted); margin-bottom: 4.8rem; }
.image {
  width: 100%; height: 32rem;       /* shorter than the Figma 402 to give the larger type its room */
  background: var(--fill-soft);
  border-radius: var(--radius-xs);
  display: grid; place-items: center;
  text-align: center;
  padding: 0 4.8rem;
  color: var(--muted);
}
.figure { margin: 0 0 4.8rem; }
.credit { color: var(--muted); margin-top: 1.2rem; }
.btn-caption { text-align: center; color: var(--muted); margin-top: 2.4rem; }
</style>
