<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ERAS } from '../data/content';
import { useUiStore } from '../stores/ui';
import AppButton from './AppButton.vue';
import CloseButton from './CloseButton.vue';

// The board passes `inert` while an overlay is up (TimelineView). It belongs on the notice, not on
// the live region beside it.
defineOptions({ inheritAttrs: false });

const ui = useUiStore();
const route = useRoute();

const target = computed(() => ERAS.find(e => e.id === ui.toast.eraId) ?? null);
// GO TO only when that era is somewhere else; reaching it puts the notice away anyway.
const showGo = computed(() => !!target.value && target.value.id !== ui.eraInView);
const announcement = computed(() => (ui.toast.open ? [ui.toast.text, ui.toast.sub].filter(Boolean).join('. ') : ''));

// The notice goes when the visitor moves on: into an overlay (a notice still waiting for its cap
// goes too), or to the era it points at.
watch([() => route.name, () => ui.toast.open], ([name]) => { if (name) ui.hideToast(); });
watch(() => ui.eraInView, id => { if (ui.toast.open && id === ui.toast.eraId) ui.hideToast(); });

// When its own buttons put the notice away, focus must not vanish with them: GO TO hands it to the
// first key of the era it scrolls to, × back to whatever had it when the notice opened.
const box = ref(null);
let before = null;
watch(() => ui.toast.open, open => { before = open ? document.activeElement : null; });
function refocus(target) {
  if (!box.value?.contains(document.activeElement)) return;
  const ok = target?.isConnected && !target.closest('[inert]');
  (ok ? target : document.querySelector('.hud-top .hud-btn'))?.focus({ preventScroll: true });
}
function go() {
  const first = document.querySelector(`.node[data-era="${ui.toast.eraId}"]`);
  ui.goToToastEra();
  refocus(first);
}
function dismiss() {
  const back = before;
  ui.hideToast();
  refocus(back);
}
</script>

<template>
  <div ref="box" class="toast" :data-open="ui.toast.open" v-bind="$attrs">
    <p class="toast__text t-heading">{{ ui.toast.text }}</p>
    <CloseButton class="toast__close" inverse aria-label="Dismiss" @click="dismiss" />
    <p v-if="ui.toast.sub" class="toast__sub t-label t-label--lc">{{ ui.toast.sub }}</p>
    <AppButton v-if="showGo" class="toast__go" @click="go">GO TO ERA {{ target.numeral }}</AppButton>
  </div>
  <!-- What the notice says, for screen readers: a polite region of its own that is always in the
       page, so a new notice is heard however the visible one fades in. -->
  <p class="sr-only" role="status">{{ announcement }}</p>
</template>

<style scoped>
.toast {
  position: absolute;
  left: calc(50% - 60rem); width: 120rem;
  top: calc(21.6rem + var(--safe-top));
  z-index: 20;            /* above the board and HUD; any overlay puts it away */
  border-radius: var(--radius-lg);
  background: var(--ink); color: var(--white);
  padding: 1.6rem 1.6rem 3.2rem 4.8rem;
  display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 1.6rem;
  /* Hidden, it is out of reach as well as out of sight: visibility flips after the fade-out. */
  transform: translateY(-4rem); opacity: 0; visibility: hidden; pointer-events: none;
  transition: transform var(--dur-md) var(--ease-standard), opacity var(--dur-md) var(--ease-standard), visibility 0s linear var(--dur-md);
}
.toast[data-open="true"] { transform: none; opacity: 1; visibility: visible; pointer-events: auto; transition-delay: 0s; }
.toast__text { margin: 0; }
.toast__sub { grid-column: 1 / -1; margin: 0 3.2rem 0 0; color: color-mix(in oklch, var(--white) 75%, var(--ink)); }
.toast__go { grid-column: 1 / -1; width: calc(100% - 3.2rem); margin-top: 2.4rem; }
/* The global ring is ink, which would vanish on the ink notice. */
.toast__close:focus-visible, .toast__go:focus-visible { outline-color: var(--white); }
</style>
