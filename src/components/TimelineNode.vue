<script setup>
import { computed, onMounted, ref } from 'vue';
import { RAIL_Y } from '../data/content';
import { photoBounds, photoUrl } from '../lib/photos';
import { useGameStore } from '../stores/game';
import { useSwingStore } from '../stores/swing';
import { useUiStore } from '../stores/ui';
import GlyphIcon from './GlyphIcon.vue';

const props = defineProps({
  node: { type: Object, required: true },   // a KEYS entry with cx / cy / row
  lag: { type: Number, default: 0 },        // canvas px the key trails the rail by while the board scrolls
});
const emit = defineEmits(['press']);

const game = useGameStore();
const swing = useSwingStore();
const ui = useUiStore();
// A key with a photo shows the keycap itself in place of the circle, a little larger since the
// photo has white around the cap; its labels and chain keep clear of it the same way.
const photo = computed(() => photoUrl(props.node.photo));
const R = computed(() => (photo.value ? 170 : 108));   // the node's radius, canvas px
// Where the node's visible top and bottom are, in canvas px: the circle's edges, or for a photo the
// cap's own edges once the photo has loaded and been measured (until then, the box's).
const img = ref(null);
const bounds = ref(null);
async function measure() {
  const el = img.value;
  if (!el) return;
  try { await el.decode(); } catch (_) { return; }   // the pixels must be there to read
  if (el.naturalWidth) bounds.value = photoBounds(el);
}
onMounted(measure);
const topEdge = computed(() => cy.value - R.value * (bounds.value ? 1 - 2 * bounds.value.top : 1));
const bottomEdge = computed(() => cy.value + R.value * (bounds.value ? 2 * bounds.value.bottom - 1 : 1));
const rem = n => `${n / 10}rem`;
// The chain doesn't stretch, so a key that trails the rail swings on an arc about its hook,
// rising a little as it goes out to the side.
const reach = props.node.cy - RAIL_Y;   // hook to the key's centre
const cy = computed(() => RAIL_Y + Math.sqrt(Math.max(0, reach ** 2 - props.lag ** 2)));

const state = computed(() => game.keyState(props.node));
// What a screen reader hears for the key: its name and year, then where it stands.
const label = computed(() => {
  const { name, year, era } = props.node;
  if (state.value === 'collected') return `${name}, ${year}, collected`;
  if (state.value === 'press') return `${name}, ${year}, not collected yet`;
  return `${name}, ${year}, locked. ${game.lockHint(era)?.sentence ?? ''}`;   // the same words as the lock notice
});
const glyph = computed(() => (state.value === 'collected' ? 'check' : state.value === 'locked' ? 'question' : null));

// The key hangs straight down from its hook on the rail by a ball chain, the kind that switches a
// light on. While the board scrolls the key trails the rail by `lag` and swings back like a
// pendulum: the chain, held taut by the key's weight, runs straight from the hook to the top of the
// key, and the key turns with it (by the Tilt knob × the chain's angle) as it rides the arc above.
// The name and year trail the key in turn, a little further each. Pressing the key pulls it down,
// chain and all (--pull in the styles). The tilt and trail factors are the Scroll physics window's
// knobs (stores/swing.js).
const tilt = computed(() => -swing.settings.tilt * Math.atan2(props.lag, cy.value - RAIL_Y));
// The chain runs from the hook to the middle of the key's top edge, wherever the key's turn puts it.
const chainStyle = computed(() => {
  const r = cy.value - topEdge.value;
  const dx = props.lag + r * Math.sin(tilt.value);
  const dy = cy.value - r * Math.cos(tilt.value) - RAIL_Y;
  return {
    left: rem(props.node.cx),
    top: rem(RAIL_Y),
    height: `calc(${rem(Math.hypot(dx, dy))} + var(--pull))`,
    rotate: `${-Math.atan2(dx, dy)}rad`,
  };
});
const nodeStyle = computed(() => ({
  left: rem(props.node.cx + props.lag),
  top: rem(cy.value),
  rotate: `${tilt.value}rad`,
  '--cap': photo.value ? `url("${photo.value}")` : null,
}));

// Labels sit 21 canvas px below the node.
const labelStyle = computed(() => ({
  left: rem(props.node.cx + props.lag),
  top: rem(bottomEdge.value + 21),
}));
const nameStyle = computed(() => ({ translate: rem(props.lag * swing.settings.nameTrail) }));
const yearStyle = computed(() => ({ translate: rem(props.lag * swing.settings.yearTrail) }));

// A locked key answers with a notice saying what opens it, standing still (so it reads the same
// with reduced motion), instead of opening.
function onPress() {
  if (state.value === 'locked') { ui.explainLock(props.node.era); return; }
  emit('press', props.node);
}
</script>

<template>
  <div class="hang">
    <div class="chain" :style="chainStyle" />
    <div class="rail-dot" :class="{ 'rail-dot--check': photo && state === 'collected' }" :style="{ left: rem(node.cx), top: rem(RAIL_Y) }">
      <GlyphIcon v-if="photo && state === 'collected'" name="check" />
    </div>
    <button
      class="node"
      :class="{ 'node--photo': photo }"
      :data-state="state"
      :data-era="node.era"
      :style="nodeStyle"
      type="button"
      :aria-label="label"
      :aria-disabled="state === 'locked'"
      @click="onPress"
    >
      <img v-if="photo" ref="img" class="photo" :src="photo" alt="" draggable="false" @load="measure">
      <GlyphIcon v-else-if="glyph" class="glyph" :name="glyph" />
      <span v-else class="glyph">PRESS</span>
    </button>
    <div class="node-label" :data-locked="state === 'locked'" :style="labelStyle">
      <div class="name" :style="nameStyle">{{ node.short ?? node.name }}</div>   <!-- the plain name: ⌘ Command reads Command on the board -->
      <div class="year" :style="yearStyle">{{ node.year }}</div>
    </div>
  </div>
</template>

<style scoped>
/* Stacking within the board's tree: the chains at the back, then the rail (TimelineBoard, 2) and the
   hooks on it, then the keys and their names, so a deeper key's chain runs down behind the keys above it. */
.hang { display: contents; }
.chain { z-index: 1; }
.rail-dot { z-index: 3; }
.node, .node-label { z-index: 4; }

/* Pressing a key pulls its chain, as you would a light's: while it is held the key and its name drop
   by --pull and the chain pays out after them, and on release they spring back, a little past rest. */
@property --pull { syntax: '<length>'; inherits: true; initial-value: 0px; }
.hang {
  --pull: 0rem;
  transition: --pull var(--dur-md) var(--ease-spring);
}
.hang:has(.node:active) {
  --pull: 2.4rem;
  transition: --pull var(--dur-xs) var(--ease-standard);
}
.node, .node-label { translate: 0 var(--pull); }

.node {
  position: absolute;
  width: 21.6rem; height: 21.6rem;
  margin: -10.8rem 0 0 -10.8rem;
  border-radius: 50%;
  border: var(--stroke) solid var(--ink);
  background: var(--white);
  display: grid; place-items: center;
  color: var(--ink);
  transition: background var(--dur-sm) var(--ease-standard), color var(--dur-sm) var(--ease-standard);
}
.node .glyph { font: 500 var(--text-label)/var(--lh-label) var(--font-display); letter-spacing: .02em; }
.node[data-state="collected"] { background: var(--ink); color: var(--white); }
.node[data-state="collected"] .glyph { font-size: 7.2rem; }   /* the ✓ and ? icons are 1em */
/* Paper rather than clear, so a chain behind it stays hidden. */
.node[data-state="locked"] { border-style: dashed; background: var(--paper); cursor: default; }
.node[data-state="locked"] .glyph { font-size: 4.8rem; color: var(--muted); }

/* A photographed key: the cap itself, no circle; the photo is shot on paper-white so its edges vanish.
   Locked it is grey and faint; collected, the ✓ sits where its chain meets the rail (see .rail-dot--check). */
.node--photo {
  width: 34rem; height: 34rem;
  margin: -17rem 0 0 -17rem;
  border: 0; border-radius: var(--radius-xs);
}
/* No fill in any state (the collected rule above would paint it ink); the rail dot carries the state. */
.node--photo[data-state] { background: none; }
/* A paper cut-out of the cap behind the photo (--cap is the photo's URL), so a chain running behind a
   faint locked cap is hidden by it rather than showing through. */
.node--photo::before {
  content: '';
  position: absolute; inset: 0;
  background: var(--paper);
  mask: var(--cap) center / contain no-repeat;
}
.node--photo .photo {
  /* Pinned to the box rather than sized by percentages: the button's grid row is auto, so a
     percentage height would fall back to the image's own aspect ratio and a portrait photo would
     spill below the box. The box is always square; a portrait cap is letterboxed inside it. */
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: contain;
  transition: filter var(--dur-sm) var(--ease-standard), opacity var(--dur-sm) var(--ease-standard);
}
.node--photo[data-state="locked"] .photo { filter: grayscale(1); opacity: 0.45; }
.node-label {
  position: absolute;
  width: 36rem; margin-left: -18rem;
  text-align: center;
  pointer-events: none;
}
.node-label .name { font: 600 var(--text-body)/var(--lh-body) var(--font-body); }   /* Body strong: the names are the board's wayfinding */
.node-label .year { font: 500 var(--text-label)/var(--lh-label) var(--font-display); color: var(--muted); letter-spacing: .02em; }
/* Each line on paper, so a deeper key's chain passes behind the words instead of through them. */
.node-label .name, .node-label .year { width: fit-content; margin-inline: auto; padding-inline: 0.8rem; background: var(--paper); }
.node-label[data-locked="true"] { color: var(--muted); }

/* The chain, drawn as a dashed line 0.3rem wide. It hangs from its top edge at the hook (left and
   top set inline) and swings about it; its length and angle come from the key's position. The
   dashes are laid from the key's end up, so when a press pulls more chain out they travel down with
   the key and new ones come out from under the rail. */
.chain {
  position: absolute;
  width: 0.3rem; margin-left: -0.15rem;
  transform-origin: 50% 0;
  pointer-events: none;
  background: repeating-linear-gradient(to top, var(--muted) 0 0.9rem, transparent 0 1.8rem);
}
.rail-dot {
  position: absolute;
  width: 2.4rem; height: 2.4rem; margin: -1.2rem 0 0 -1.2rem;
  border-radius: 50%; background: var(--ink);
  transition: width var(--dur-sm) var(--ease-standard), height var(--dur-sm) var(--ease-standard), margin var(--dur-sm) var(--ease-standard);
}
/* A collected photographed key: the junction grows into the ✓ badge, the same as a cleared era dot's. */
.rail-dot--check {
  width: 6.4rem; height: 6.4rem; margin: -3.2rem 0 0 -3.2rem;
  display: grid; place-items: center;
  color: var(--white);
  font-size: 4.8rem;
}
</style>
