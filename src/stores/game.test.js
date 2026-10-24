import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { useGameStore, UNLOCK_AT } from './game';
import { ERAS, KEYS } from '../data/content';

const STORAGE_KEY = 'any-key/state/v2';
const idsIn = era => KEYS.filter(k => k.era === era).map(k => k.id);

/** A fresh store, as if the page had just loaded with whatever is in localStorage. */
function freshStore() {
  setActivePinia(createPinia());
  return useGameStore();
}

/** Collect every key, era by era, in board order. */
function collectAll(game) {
  for (const era of ERAS) idsIn(era.id).forEach(id => game.collect(id));
}

beforeEach(() => {
  localStorage.clear();
});

describe('a new visitor', () => {
  it('starts on the start screen with only Era I open and nothing collected', () => {
    const game = freshStore();
    expect(game.started).toBe(false);
    expect(game.unlocked).toEqual([1]);
    expect(game.count).toBe(0);
    expect(game.achievements).toEqual([]);
    expect(game.total).toBe(KEYS.length);
  });

  it('earns "There is no Any key" for pressing the start screen, once', () => {
    const game = freshStore();
    game.start();
    game.start();
    expect(game.started).toBe(true);
    expect(game.achievements).toEqual(['anyKey']);
  });
});

describe('collecting', () => {
  it('refuses keys in a locked era, unknown keys and keys already collected', () => {
    const game = freshStore();
    const [first] = idsIn(1);
    const [locked] = idsIn(2);
    expect(game.collect(locked)).toBeNull();
    expect(game.collect('no-such-key')).toBeNull();
    game.collect(first);
    expect(game.collect(first)).toBeNull();
    expect(game.collected).toEqual([first]);
  });

  it('awards First press on the first key only', () => {
    const game = freshStore();
    const [a, b] = idsIn(1);
    game.collect(a);
    expect(game.hasAchievement('firstPress')).toBe(true);
    game.collect(b);
    expect(game.achievements.filter(x => x === 'firstPress')).toHaveLength(1);
  });

  it(`unlocks the next era on the ${UNLOCK_AT}nd key in an era, and reports it once`, () => {
    const game = freshStore();
    const ids = idsIn(1);
    for (let i = 0; i < UNLOCK_AT - 1; i++) expect(game.collect(ids[i])).toBeNull();
    expect(game.isUnlocked(2)).toBe(false);

    expect(game.collect(ids[UNLOCK_AT - 1])).toBe(2);
    expect(game.isUnlocked(2)).toBe(true);
    expect(game.consumePendingUnlock()).toBe(2);
    expect(game.consumePendingUnlock()).toBeNull();

    // A third key in the same era unlocks nothing new.
    expect(game.collect(ids[UNLOCK_AT])).toBeNull();
    expect(game.unlocked).toEqual([1, 2]);
  });

  it('marks an era cleared only when all of its keys are collected', () => {
    const game = freshStore();
    const ids = idsIn(1);
    ids.slice(0, -1).forEach(id => game.collect(id));
    expect(game.eraCleared(1)).toBe(false);
    expect(game.hasAchievement('era1')).toBe(false);
    game.collect(ids[ids.length - 1]);
    expect(game.eraCleared(1)).toBe(true);
    expect(game.hasAchievement('era1')).toBe(true);
  });

  it('completes the set, era by era, with every achievement', () => {
    const game = freshStore();
    game.start();
    collectAll(game);
    expect(game.isComplete).toBe(true);
    expect(game.unlocked).toEqual(ERAS.map(e => e.id));
    expect(new Set(game.achievements)).toEqual(new Set(['anyKey', 'firstPress', 'era1', 'era2', 'era3', 'era4', 'fullSet']));
  });

  it('opens a key only when its era is unlocked', () => {
    const game = freshStore();
    expect(game.canOpen(idsIn(1)[0])).toBe(true);
    expect(game.canOpen(idsIn(2)[0])).toBe(false);
    expect(game.canOpen('no-such-key')).toBe(false);
    expect(game.keyState(game.keyById(idsIn(2)[0]))).toBe('locked');
    expect(game.keyState(game.keyById(idsIn(1)[0]))).toBe('press');
  });
});

describe('the caption under ✓ COLLECTED', () => {
  it('counts down to the next era, then names the unlock and the clear', () => {
    const game = freshStore();
    const ids = idsIn(1);
    game.collect(ids[0]);
    expect(game.collectedCaption(game.keyById(ids[0]))).toBe('+1 · 1 of 4 in Era I · one more unlocks Era II');
    game.collect(ids[1]);
    expect(game.collectedCaption(game.keyById(ids[1]))).toBe('+1 · 2 of 4 in Era I · Era II unlocked');
    game.consumePendingUnlock();
    game.collect(ids[2]);
    expect(game.collectedCaption(game.keyById(ids[2]))).toBe('+1 · 3 of 4 in Era I');
    game.collect(ids[3]);
    expect(game.collectedCaption(game.keyById(ids[3]))).toBe('+1 · 4 of 4 in Era I · Era I cleared');
  });
});

describe('reset', () => {
  it('clears the collection, re-locks Eras II to IV and returns to the start screen', () => {
    const game = freshStore();
    game.start();
    collectAll(game);
    game.markCompletionShown();
    game.reset();
    expect(game.collected).toEqual([]);
    expect(game.unlocked).toEqual([1]);
    expect(game.achievements).toEqual(['anyKey']);
    expect(game.completionShown).toBe(false);
    expect(game.pendingUnlock).toBeNull();
    expect(game.started).toBe(false);
  });
});

describe('saved state', () => {
  it('survives a reload', async () => {
    const game = freshStore();
    game.start();
    idsIn(1).slice(0, 2).forEach(id => game.collect(id));
    await nextTick();   // the store saves from a watcher

    const reloaded = freshStore();
    expect(reloaded.started).toBe(true);
    expect(reloaded.collected).toEqual(idsIn(1).slice(0, 2));
    expect(reloaded.unlocked).toEqual([1, 2]);
    expect(reloaded.achievements).toEqual(['anyKey', 'firstPress']);
  });

  it('does not save the pending unlock, which only lives until the card closes', async () => {
    const game = freshStore();
    idsIn(1).slice(0, 2).forEach(id => game.collect(id));
    await nextTick();
    expect(freshStore().pendingUnlock).toBeNull();
  });

  it('falls back to a fresh game when the saved state is unreadable', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    const game = freshStore();
    expect(game.collected).toEqual([]);
    expect(game.unlocked).toEqual([1]);
  });

  it('never starts with every era locked', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ started: true, collected: [], unlocked: [] }));
    expect(freshStore().unlocked).toEqual([1]);
  });
});
