<script setup>
import { useOverlayNav } from '../composables/useOverlayNav';
import { ERAS, ACHIEVEMENTS } from '../data/content';
import { useGameStore } from '../stores/game';
import ModalShell from '../components/ModalShell.vue';

const game = useGameStore();
const { close } = useOverlayNav();

function statState(key) {
  if (game.isCollected(key.id)) return 'collected';
  return game.isUnlocked(key.era) ? 'open' : 'locked';
}
const glyph = st => (st === 'collected' ? '✓' : st === 'locked' ? '?' : '');
</script>

<template>
  <ModalShell title="Stats" title-id="stats-title" @close="close">
    <p class="stats-summary t-label t-label--lc">{{ game.count }} of {{ game.total }} collected</p>

    <div v-for="era in ERAS" :key="era.id" class="stats-era">
      <p class="stats-era__label">ERA {{ era.numeral }} · {{ era.name }}</p>
      <div class="stats-row">
        <div v-for="key in game.eraKeys(era.id)" :key="key.id" class="stat" :data-state="statState(key)">
          <div class="stat__circle">{{ glyph(statState(key)) }}</div>
          <div class="stat__label">{{ key.short ?? key.name }}</div>
        </div>
      </div>
    </div>

    <p class="t-label muted">Achievements</p>
    <div class="ach-list">
      <div v-for="a in ACHIEVEMENTS" :key="a.id" class="ach" :data-done="game.hasAchievement(a.id)">
        <div class="ach__circle">{{ game.hasAchievement(a.id) ? '✓' : '' }}</div>
        <div>
          <div class="t-strong">{{ a.title }}</div>
          <div class="ach__sub t-label t-label--lc">{{ a.sub }}</div>
        </div>
      </div>
    </div>
  </ModalShell>
</template>

<style scoped>
.stats-summary { color: var(--muted); margin-bottom: 4.8rem; }
.stats-era { margin-bottom: 4.8rem; }
.stats-era__label { font: 700 var(--text-heading)/var(--lh-heading) var(--font-display); color: var(--muted); margin-bottom: 2.4rem; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4.8rem; }   /* four across whatever the sheet's inner width */
.stat { display: flex; flex-direction: column; align-items: center; gap: 2.4rem; }
.stat__circle {
  width: 14.4rem; height: 14.4rem; border-radius: 50%;
  border: var(--stroke) solid var(--muted);
  display: grid; place-items: center;
  font: 600 5rem/1 var(--font-body); color: var(--muted);
}
.stat[data-state="locked"] .stat__circle { border-style: dashed; }
.stat[data-state="collected"] .stat__circle { background: var(--ink); border-color: var(--ink); color: var(--white); }
.stat__label { font: 500 var(--text-label)/var(--lh-label) var(--font-display); letter-spacing: .02em; text-align: center; }
.ach-list { display: flex; flex-direction: column; gap: 2.4rem; margin-top: 2.4rem; }
.ach {
  min-height: 16rem;
  border: 0.3rem solid var(--line-soft);
  border-radius: var(--radius-md);
  display: flex; align-items: center; gap: 3.2rem;
  padding: 1.6rem 3.2rem;
}
.ach__circle {
  width: 8rem; height: 8rem; border-radius: 50%; flex: 0 0 auto;
  border: var(--stroke) solid var(--ink);
  display: grid; place-items: center;
  font: 600 4.4rem/1 var(--font-body);
}
.ach[data-done="true"] .ach__circle { background: var(--ink); color: var(--white); }
.ach[data-done="true"] { border-color: var(--ink); }
.ach__sub { color: var(--muted); }
</style>
