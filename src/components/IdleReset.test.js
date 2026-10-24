import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHashHistory, RouterView } from 'vue-router';
import IdleReset from './IdleReset.vue';
import { COUNTDOWN_MS, IDLE_MS } from '../lib/kiosk';
import { useGameStore } from '../stores/game';
import { usePanelsStore } from '../stores/panels';
import { useUiStore } from '../stores/ui';
import { KEYS } from '../data/content';

const realSleep = ms => new Promise(r => setTimeout(r, ms));   // setTimeout stays real: only the clock and the interval are faked
const Stub = name => defineComponent({ name, render: () => h('div', name) });

let wrapper, router, game;
const prompt = () => wrapper.find('.idle');

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
  localStorage.clear();
  setActivePinia(createPinia());
  game = useGameStore();
  game.start();
  game.collect(KEYS[0].id);

  window.history.replaceState(null, '', '/#/');
  router = createRouter({
    history: createWebHashHistory(),
    routes: [{
      path: '/', component: { render: () => h(RouterView) },
      children: ['start', 'menu'].map(name => ({ path: name, name, component: Stub(name) })),
    }],
  });
  wrapper = mount({ render: () => [h(RouterView), h(IdleReset)] }, { global: { plugins: [router] }, attachTo: document.body });
  await router.isReady();
});

afterEach(() => {
  wrapper.unmount();
  vi.useRealTimers();
});

async function idleFor(ms) {
  vi.advanceTimersByTime(ms);
  await flushPromises();
}

describe('the kiosk idle reset', () => {
  it('asks "Still there?" after two minutes without input, counting down from 30', async () => {
    await idleFor(IDLE_MS - 1000);
    expect(prompt().exists()).toBe(false);
    await idleFor(1500);
    expect(prompt().exists()).toBe(true);
    expect(prompt().text()).toContain('Still there?');
    expect(prompt().text()).toContain(String(COUNTDOWN_MS / 1000));
  });

  it('starts the two minutes over on any input', async () => {
    await idleFor(IDLE_MS - 10_000);
    window.dispatchEvent(new Event('pointerdown'));
    await idleFor(20_000);
    expect(prompt().exists()).toBe(false);
  });

  it('keeps the place on any key, and that key does nothing else', async () => {
    const elsewhere = vi.fn();
    window.addEventListener('keydown', elsewhere);
    await idleFor(IDLE_MS + 500);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    await flushPromises();
    window.removeEventListener('keydown', elsewhere);
    expect(prompt().exists()).toBe(false);
    expect(elsewhere).not.toHaveBeenCalled();
    expect(game.count).toBe(1);
  });

  it('keeps the place on a touch', async () => {
    await idleFor(IDLE_MS + 500);
    await prompt().trigger('click');
    expect(prompt().exists()).toBe(false);
    await idleFor(COUNTDOWN_MS);
    expect(game.count).toBe(1);
  });

  it('resets everything for the next visitor when the countdown runs out', async () => {
    await router.push({ name: 'menu', state: { overlayDepth: 1 } });
    usePanelsStore().open('colors');
    useUiStore().showToast({ text: 'ERA II · ELECTRIC UNLOCKED', eraId: 2 });

    await idleFor(IDLE_MS + 500);
    await idleFor(COUNTDOWN_MS + 500);
    await realSleep(50);
    await flushPromises();

    expect(game.started).toBe(false);
    expect(game.count).toBe(0);
    expect(router.currentRoute.value.name).toBe('start');
    expect(usePanelsStore().isOpen('colors')).toBe(false);
    expect(useUiStore().toast.open).toBe(false);
    expect(prompt().exists()).toBe(false);
  });

  it('never counts on the start screen', async () => {
    await router.replace({ name: 'start' });
    await idleFor(IDLE_MS * 3);
    expect(prompt().exists()).toBe(false);
    expect(game.count).toBe(1);
  });
});
