import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useGameStore } from './game';
import { useUiStore } from './ui';
import { KEYS } from '../data/content';

const idsIn = era => KEYS.filter(k => k.era === era).map(k => k.id);
const rect = { left: 0, top: 0, width: 10, height: 10 };
let ui, game;

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
  game = useGameStore();
  ui = useUiStore();
});

describe('the notice', () => {
  it('opens at once when nothing is in the air, and stays until put away', () => {
    ui.showToast({ text: 'ERA II · ELECTRIC UNLOCKED', eraId: 2 });
    expect(ui.toast).toMatchObject({ open: true, text: 'ERA II · ELECTRIC UNLOCKED', eraId: 2 });
    ui.hideToast();
    expect(ui.toast.open).toBe(false);
  });

  it('waits for a collected key\'s cap to land before it opens', () => {
    ui.launchFlight(rect, '⇧', 1);
    ui.showToast({ text: 'ERA II · ELECTRIC UNLOCKED', eraId: 2 });
    expect(ui.toast.open).toBe(false);
    ui.landFlight(ui.flight.n);
    expect(ui.toast).toMatchObject({ open: true, eraId: 2 });
  });

  it('is dropped, not shown later, if put away while it waits', () => {
    ui.launchFlight(rect, '⇧', 1);
    ui.showToast({ text: 'ERA II · ELECTRIC UNLOCKED', eraId: 2 });
    ui.hideToast();
    ui.landFlight(ui.flight.n);
    expect(ui.toast.open).toBe(false);
  });

  it('goes to its era only when asked', () => {
    const before = ui.scrollRequest.n;
    ui.showToast({ text: 'ERA II · ELECTRIC UNLOCKED', eraId: 2 });
    expect(ui.scrollRequest.n).toBe(before);
    ui.goToToastEra();
    expect(ui.toast.open).toBe(false);
    expect(ui.scrollRequest).toMatchObject({ eraId: 2, n: before + 1 });
  });
});

describe('explaining a locked key', () => {
  it('says how many keys in the era before open it, and points there', () => {
    ui.explainLock(2);
    expect(ui.toast).toMatchObject({ open: true, text: 'ERA II · LOCKED', sub: 'Collect 2 keys in Era I to unlock Era II.', eraId: 1 });
  });

  it('counts down once some are collected', () => {
    game.collect(idsIn(1)[0]);
    ui.explainLock(2);
    expect(ui.toast.sub).toBe('Collect one more key in Era I to unlock Era II.');
  });

  it('points at the first locked era on the way to a later one', () => {
    ui.explainLock(4);
    expect(ui.toast).toMatchObject({ text: 'ERA IV · LOCKED', sub: 'Collect 2 keys in Era I to unlock Era II.', eraId: 1 });
  });

  it('says nothing about an era that is already open', () => {
    ui.explainLock(1);
    expect(ui.toast.open).toBe(false);
  });
});
