<script setup>
import { ref, watch } from 'vue';
import { useOverlayNav } from '../composables/useOverlayNav';
import { useGameStore } from '../stores/game';

const game = useGameStore();
const nav = useOverlayNav();
const pop = ref(false);

// Pulse the counter whenever it changes
watch(() => game.count, () => {
  pop.value = false;
  requestAnimationFrame(() => { pop.value = true; });
});
</script>

<template>
  <header class="hud-top">
    <button class="menu-btn" type="button" aria-label="Menu" @click="nav.open('menu')">
      <svg viewBox="0 0 56 56" aria-hidden="true"><path d="M12 17h32M12 28h32M12 39h32" /></svg>
    </button>
    <div class="hud-total t-heading" aria-live="polite">
      <span>COLLECTED</span>
      <span><span class="count" :class="{ pop }" @animationend="pop = false">{{ game.count }}</span>/{{ game.total }}</span>
    </div>
  </header>
</template>

<style scoped>
.hud-top {
  flex: 0 0 auto;
  height: calc(16.8rem + var(--safe-top));
  padding-top: var(--safe-top);
  /* Inset from the stage edges by --hud-gutter; the border runs down both sides and along the bottom. */
  width: calc(min(100%, var(--phone-w)) - 2 * var(--hud-gutter));
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: calc(4.8rem + var(--safe-left)) calc(4.8rem + var(--safe-right));
  background: var(--bar);
  border: var(--hairline) solid var(--line-soft);
  border-top: 0;
  z-index: 3;
}
/* Bare glyph, no circle: same tap target as an era dot, so the two bars still line up. */
.menu-btn {
  width: var(--tap); height: var(--tap);
  border: 0;
  background: none;
  padding: 0;
  display: grid; place-items: center;
  transition: transform .08s;
}
.menu-btn:active { transform: scale(.94); }
.menu-btn svg { width: var(--icon); height: var(--icon); stroke: var(--ink); stroke-width: 5; stroke-linecap: round; fill: none; }
.hud-total { display: flex; gap: 1.2rem; }
.hud-total .count { min-width: 3.6rem; text-align: right; }
/* Pulse the count when it changes */
@keyframes pop { 50% { transform: scale(1.18); } }
.pop { animation: pop .3s; display: inline-block; }
</style>
