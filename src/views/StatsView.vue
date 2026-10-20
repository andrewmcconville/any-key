<script setup>
import { useRouter } from 'vue-router';
import { ERAS, ACHIEVEMENTS } from '../data/content';
import { useGameStore } from '../stores/game';
import ModalShell from '../components/ModalShell.vue';

const game = useGameStore();
const router = useRouter();
const close = () => router.replace({ path: '/' });

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
