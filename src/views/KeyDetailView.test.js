import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHashHistory, RouterView } from 'vue-router';
import KeyDetailView from './KeyDetailView.vue';
import { useFlightStore } from '../stores/flight';
import { useGameStore } from '../stores/game';
import { useUiStore } from '../stores/ui';
import { ERAS, KEYS } from '../data/content';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const Completion = defineComponent({ name: 'Completion', render: () => h('div', 'complete') });

let wrapper, router, game;
async function boot() {
  window.history.replaceState(null, '', '/#/');
  router = createRouter({
    history: createWebHashHistory(),
    routes: [{
      path: '/', component: { render: () => h(RouterView) },
      children: [
        { path: 'key/:id', name: 'key', component: KeyDetailView, props: true },
        // Lazy, like the real route: the swap to Completion stays pending while its chunk loads.
        { path: 'complete', name: 'complete', component: () => sleep(50).then(() => Completion) },
      ],
    }],
  });
  wrapper = mount({ render: () => h(RouterView) }, { global: { plugins: [router] }, attachTo: document.body });
  await router.isReady();
}

async function openKey(id) {
  await router.push({ name: 'key', params: { id }, state: { overlayDepth: 1 } });
  await flushPromises();
  return wrapper.find('.btn--keycap');
}

beforeEach(async () => {
  localStorage.clear();
  setActivePinia(createPinia());
  game = useGameStore();
  game.start();
  // A beat of 0 makes the auto-close fire on the next task, inside the window where the first
  // close is still navigating: the timing a slow tap at the end of the real beat produces.
  useFlightStore().set('beat', 0);
  await boot();
});
afterEach(() => wrapper.unmount());

describe('closing a key card during the collect beat', () => {
  it('still shows the Completion screen after the 14th key', async () => {
    const last = KEYS[KEYS.length - 1].id;
    for (const era of ERAS) KEYS.filter(k => k.era === era.id && k.id !== last).forEach(k => game.collect(k.id));
    expect(game.count).toBe(KEYS.length - 1);

    const button = await openKey(last);
    await button.trigger('click');   // PRESS TO COLLECT: collects, starts the beat
    await button.trigger('click');   // ✓ COLLECTED right away: closes the card
    await sleep(150);
    await flushPromises();

    expect(game.isComplete).toBe(true);
    expect(router.currentRoute.value.name).toBe('complete');
    expect(game.completionShown).toBe(true);
  });

  it('still shows Completion when the beat closes the card first and the tap comes after', async () => {
    const last = KEYS[KEYS.length - 1].id;
    KEYS.filter(k => k.id !== last).forEach(k => game.collect(k.id));

    const button = await openKey(last);
    await button.trigger('click');   // collects; the beat (0 here) closes the card on the next task
    await sleep(5);                  // the swap to Completion is under way, its chunk still loading
    await button.trigger('click');   // a late tap on ✓ COLLECTED
    await sleep(150);
    await flushPromises();

    expect(router.currentRoute.value.name).toBe('complete');
  });

  it('navigates once and announces an unlocked era once', async () => {
    const [a, b] = KEYS.filter(k => k.era === 1);
    game.collect(a.id);
    const ui = useUiStore();
    const shown = [];
    ui.$onAction(({ name, args }) => { if (name === 'showToast') shown.push(args[0].text); });

    const button = await openKey(b.id);
    const go = vi.spyOn(router, 'go');
    const replace = vi.spyOn(router, 'replace');
    await button.trigger('click');
    await button.trigger('click');
    await sleep(150);
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe('/');
    expect(go.mock.calls.length + replace.mock.calls.length).toBe(1);
    expect(shown).toEqual(['ERA II · ELECTRIC UNLOCKED']);
  });
});

describe('leaving a key card by the back gesture during the collect beat', () => {
  beforeEach(() => useFlightStore().set('beat', 1000));   // long enough to go back before it fires

  async function backDuringBeat(id) {
    const button = await openKey(id);
    await button.trigger('click');
    const landed = new Promise(resolve => { const stop = router.afterEach(() => { stop(); resolve(); }); });
    router.back();
    await landed;
    await sleep(100);
    await flushPromises();
  }

  it('still announces the era it unlocked, once, and leaves nothing pending', async () => {
    const [a, b] = KEYS.filter(k => k.era === 1);
    game.collect(a.id);
    const ui = useUiStore();
    const shown = [];
    ui.$onAction(({ name, args }) => { if (name === 'showToast') shown.push(args[0].text); });

    await backDuringBeat(b.id);

    expect(router.currentRoute.value.fullPath).toBe('/');
    expect(shown).toEqual(['ERA II · ELECTRIC UNLOCKED']);
    expect(game.pendingUnlock).toBeNull();
  });

  it('still shows Completion after the 14th key', async () => {
    const last = KEYS[KEYS.length - 1].id;
    KEYS.filter(k => k.id !== last).forEach(k => game.collect(k.id));

    await backDuringBeat(last);
    await sleep(100);
    await flushPromises();

    expect(router.currentRoute.value.name).toBe('complete');
    expect(game.completionShown).toBe(true);
  });
});
