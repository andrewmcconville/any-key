import { afterEach, describe, expect, it } from 'vitest';
import { h } from 'vue';
import { mount } from '@vue/test-utils';
import ModalShell from './ModalShell.vue';

let wrapper;
afterEach(() => wrapper?.unmount());

describe('a modal sheet as it opens', () => {
  it('takes focus on its title', () => {
    wrapper = mount(ModalShell, { props: { title: 'Stats', titleId: 'stats-title' }, attachTo: document.body });
    expect(document.activeElement.id).toBe('stats-title');
    expect(document.activeElement.getAttribute('tabindex')).toBe('-1');
  });

  it('takes focus on a heading in its content when it has no title bar', () => {
    wrapper = mount(ModalShell, {
      props: { closable: false },
      slots: { default: () => h('h2', { id: 'modal-title' }, '14 / 14') },
      attachTo: document.body,
    });
    expect(document.activeElement.id).toBe('modal-title');
  });

  it('takes focus on the sheet itself when nothing names it', () => {
    wrapper = mount(ModalShell, { props: { titleId: 'nothing-here' }, attachTo: document.body });
    expect(document.activeElement.classList.contains('modal')).toBe(true);
  });
});
