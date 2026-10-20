<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';

const game = useGameStore();
const router = useRouter();
const pop = ref(false);

// Pulse the counter whenever it changes
watch(() => game.count, () => {
  pop.value = false;
  requestAnimationFrame(() => { pop.value = true; });
});
</script>

<template>
  <header class="hud-top">
    <button class="menu-btn" type="button" aria-label="Menu" @click="router.push({ name: 'menu' })">
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
  flex: 0 0 16.8rem;
  height: 16.8rem;
  width: 100%;
  max-width: var(--phone-w);
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4.8rem;
  background: #efefef;
  border-bottom: 0.2rem solid var(--line-soft);
  z-index: 3;
}
/* Same size and stroke as an era dot, so the two bars share one control language. */
.menu-btn {
  width: 9.6rem; height: 9.6rem;
  border-radius: 50%;
  border: var(--stroke) solid var(--ink);
  background: var(--white);
  display: grid; place-items: center;
  transition: transform .08s;
}
.menu-btn:active { transform: scale(.94); }
.menu-btn svg { width: 5.6rem; height: 5.6rem; stroke: var(--ink); stroke-width: 5; stroke-linecap: round; fill: none; }
.hud-total { display: flex; gap: 1.2rem; }
.hud-total .count { min-width: 2.9rem; text-align: right; }
/* Pulse the count when it changes */
@keyframes pop { 50% { transform: scale(1.18); } }
.pop { animation: pop .3s; display: inline-block; }
</style>
