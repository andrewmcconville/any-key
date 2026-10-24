import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHashHistory, RouterView } from 'vue-router';
import { useOverlayNav } from './useOverlayNav';

// The board is the parent route; overlays are its children, as in src/router/index.js.
let nav;
const Board = defineComponent({ setup() { nav = useOverlayNav(); return () => h(RouterView); } });
const Overlay = name => defineComponent({ name, render: () => h('div', name) });

let wrapper, router;
async function boot(path = '/') {
  window.history.replaceState(null, '', `/#${path}`);
  router = createRouter({
    history: createWebHashHistory(),
    routes: [{
      path: '/', component: Board,
      children: ['menu', 'about', 'stats', 'complete'].map(name => ({ path: name, name, component: Overlay(name) }))
        .concat({ path: 'key/:id', name: 'key', component: Overlay('key') }),
    }],
  });
  wrapper = mount({ render: () => h(RouterView) }, { global: { plugins: [router] } });
  await router.isReady();
}
const where = () => router.currentRoute.value.fullPath;

beforeEach(() => boot());
afterEach(() => wrapper.unmount());

describe('the overlay stack', () => {
  it('counts depth: the board is 0 and each overlay opened on top adds one', async () => {
    expect(nav.depth()).toBe(0);
    await nav.open('menu');
    expect(nav.depth()).toBe(1);
    await nav.open('about');
    expect(nav.depth()).toBe(2);
  });

  it('closes back to whatever the overlay was opened from', async () => {
    await nav.open('menu');
    await nav.open('about');
    await nav.close();
    expect(where()).toBe('/menu');
    expect(nav.depth()).toBe(1);
    await nav.close();
    expect(where()).toBe('/');
    expect(nav.depth()).toBe(0);
  });

  it('swaps one overlay for another at the same depth, so closing the new one lands on the board', async () => {
    await nav.open('key', { id: 'space' });
    await nav.swap('complete');
    expect(where()).toBe('/complete');
    expect(nav.depth()).toBe(1);
    await nav.close();
    expect(where()).toBe('/');
  });

  it('closes the whole stack at once', async () => {
    await nav.open('menu');
    await nav.open('stats');
    await nav.closeAll();
    expect(where()).toBe('/');
    expect(nav.depth()).toBe(0);
  });

  it('has the browser back button do what close does', async () => {
    await nav.open('menu');
    await nav.open('about');
    const back = new Promise(resolve => { const stop = router.afterEach(() => { stop(); resolve(); }); });
    window.history.back();
    await back;
    expect(where()).toBe('/menu');
  });
});

describe('an overlay reached by a direct link', () => {
  beforeEach(async () => { wrapper.unmount(); await boot('/about'); });

  it('is depth 0, and closing it replaces it with the board instead of leaving the app', async () => {
    expect(where()).toBe('/about');
    expect(nav.depth()).toBe(0);
    const before = window.history.length;
    await nav.close();
    expect(where()).toBe('/');
    expect(window.history.length).toBe(before);
  });
});
