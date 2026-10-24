import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHashHistory, RouterView } from 'vue-router';
import ToastBanner from './ToastBanner.vue';
import { useUiStore } from '../stores/ui';

const Stub = name => defineComponent({ name, render: () => h('div', name) });
const rect = { left: 0, top: 0, width: 10, height: 10 };
let wrapper, router, ui, extras;

beforeEach(async () => {
  localStorage.clear();
  setActivePinia(createPinia());
  ui = useUiStore();
  window.history.replaceState(null, '', '/#/');
  router = createRouter({
    history: createWebHashHistory(),
    routes: [{ path: '/', component: { render: () => h(RouterView) }, children: [{ path: 'menu', name: 'menu', component: Stub('menu') }] }],
  });
  wrapper = mount({ render: () => [h(RouterView), h(ToastBanner)] }, { global: { plugins: [router] }, attachTo: document.body });
  await router.isReady();
  extras = [];
});
afterEach(() => {
  wrapper.unmount();
  extras.forEach(el => el.remove());
});

/** A button elsewhere on the page, like a key node or the HUD's menu button. */
function addButton(attrs = {}) {
  const b = document.createElement('button');
  Object.entries(attrs).forEach(([k, v]) => b.setAttribute(k, v));
  document.body.append(b);
  extras.push(b);
  return b;
}

describe('the notice goes when the visitor moves on', () => {
  it('when an overlay opens', async () => {
    ui.showToast({ text: 'ERA II · ELECTRIC UNLOCKED', eraId: 2 });
    await router.push({ name: 'menu' });
    await flushPromises();
    expect(ui.toast.open).toBe(false);
  });

  it('even while it is still waiting for its cap to land', async () => {
    ui.launchFlight(rect, '⇧', 1);
    ui.showToast({ text: 'ERA II · ELECTRIC UNLOCKED', eraId: 2 });
    await router.push({ name: 'menu' });
    await flushPromises();
    ui.landFlight(ui.flight.n);
    expect(ui.toast.open).toBe(false);
  });

  it('when the board reaches the era it points at', async () => {
    ui.showToast({ text: 'ERA II · ELECTRIC UNLOCKED', eraId: 2 });
    await nextTick();
    expect(wrapper.find('.toast__go').exists()).toBe(true);
    ui.eraInView = 2;
    await nextTick();
    expect(ui.toast.open).toBe(false);
  });
});

describe('the notice hands focus on when its own buttons put it away', () => {
  it('× gives focus back to what had it when the notice opened', async () => {
    const key = addButton();
    key.focus();
    ui.showToast({ text: 'ERA III · LOCKED', sub: 'Collect 2 keys in Era II to unlock Era III.', eraId: 2 });
    await nextTick();
    const close = wrapper.find('.toast__close');
    close.element.focus();
    await close.trigger('click');
    expect(ui.toast.open).toBe(false);
    expect(document.activeElement).toBe(key);
  });

  it('GO TO ERA gives focus to the first key of that era and scrolls there', async () => {
    const first = addButton({ class: 'node', 'data-era': '2' });
    ui.showToast({ text: 'ERA II · ELECTRIC UNLOCKED', eraId: 2 });
    await nextTick();
    const go = wrapper.find('.toast__go');
    go.element.focus();
    await go.trigger('click');
    expect(document.activeElement).toBe(first);
    expect(ui.scrollRequest.eraId).toBe(2);
  });
});
