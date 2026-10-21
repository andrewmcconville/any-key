import { createRouter, createWebHashHistory } from 'vue-router';
import { useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';
import TimelineView from '../views/TimelineView.vue';

// Every overlay is a child route of the timeline so the board stays mounted
// (and keeps its scroll position) underneath the modal.
const routes = [
  {
    path: '/',
    component: TimelineView,
    children: [
      { path: 'start',       name: 'start',      component: () => import('../views/StartView.vue') },
      { path: 'key/:id',     name: 'key',        component: () => import('../views/KeyDetailView.vue'), props: true },
      { path: 'stats',       name: 'stats',      component: () => import('../views/StatsView.vue') },
      { path: 'menu',        name: 'menu',       component: () => import('../views/MenuView.vue') },
      { path: 'how-to-play', name: 'how-to-play', component: () => import('../views/HowToPlayView.vue') },
      { path: 'about',       name: 'about',      component: () => import('../views/AboutView.vue') },
      { path: 'reset',       name: 'reset',      component: () => import('../views/ResetView.vue') },
      { path: 'complete',    name: 'complete',   component: () => import('../views/CompletionView.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHashHistory(),   // hash history: works on GitHub Pages and plain static hosts
  routes,
});

// Gate everything behind the start screen until the visitor has pressed any key.
router.beforeEach(to => {
  const game = useGameStore();
  if (!game.started && to.name !== 'start') return { name: 'start' };
  if (game.started && to.name === 'start') return { path: '/' };
  if (to.name === 'key' && !game.canOpen(to.params.id)) return { path: '/' };
  return true;
});

// Overlays are a stack in browser history above the board (see composables/useOverlayNav.js).
// Whenever the bare board is shown, remember its history position so "close" knows how far back is.
router.afterEach(to => {
  if (to.name === undefined) useUiStore().boardPosition = window.history.state?.position ?? 0;
});

export default router;
