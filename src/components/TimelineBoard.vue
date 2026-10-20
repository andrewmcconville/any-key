<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ERAS, KEYS, ERA_WIDTH } from '../data/content';
import { UNLOCK_AT, useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';
import TimelineNode from './TimelineNode.vue';

const game = useGameStore();
const ui = useUiStore();
const router = useRouter();
const board = ref(null);
const rem = n => `${n / 10}rem`;
const BOARD_WIDTH = ERAS.length * ERA_WIDTH;

// canvas px → CSS px for this viewport
const scale = () => board.value.scrollWidth / BOARD_WIDTH;

function onScroll() {
  const el = board.value;
  ui.boardScrolled = el.scrollLeft > 20;
  const centre = el.scrollLeft / scale() + 720;
  ui.eraInView = Math.min(ERAS.length, Math.max(1, Math.floor(centre / ERA_WIDTH) + 1));
}

function scrollToEra(eraId, behavior = 'smooth') {
  board.value?.scrollTo({ left: (eraId - 1) * ERA_WIDTH * scale(), behavior });
}

watch(() => ui.scrollRequest, req => scrollToEra(req.eraId));
onMounted(onScroll);

function openKey(node) {
  router.push({ name: 'key', params: { id: node.id } });
}

const lockLine = era => `LOCKED · collect ${UNLOCK_AT} keys in Era ${ERAS[era.id - 2]?.numeral ?? ''} to unlock`;
</script>

<template>
  <main ref="board" class="board" :data-scrolled="ui.boardScrolled" @scroll.passive="onScroll">
    <div class="tree">
      <div class="rail" />

      <section
        v-for="era in ERAS"
        :key="era.id"
        class="era-region"
        :data-locked="!game.isUnlocked(era.id)"
        :style="{ left: rem((era.id - 1) * ERA_WIDTH) }"
      >
        <p class="era-region__label t-label">ERA {{ era.numeral }} · {{ era.name }} · {{ era.years }}</p>
        <p class="era-region__lock t-label t-label--lc">{{ lockLine(era) }}</p>
      </section>

      <div
        v-for="era in ERAS.slice(1)"
        :key="`break-${era.id}`"
        class="rail-break"
        :style="{ left: rem((era.id - 1) * ERA_WIDTH - 40) }"
      >≈</div>

      <TimelineNode v-for="node in KEYS" :key="node.id" :node="node" @press="openKey" />

      <p class="swipe-hint t-label t-label--lc">swipe to explore →</p>
    </div>
  </main>
</template>
