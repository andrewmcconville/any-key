import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { KEYS, ERAS } from '../data/content';

const STORAGE_KEY = 'any-key/state/v2';
export const UNLOCK_AT = 2;   // keys collected in an era to open the next

export const useGameStore = defineStore('game', () => {
  // ----- persisted state -----
  const started = ref(false);
  const collected = ref([]);        // key ids, in collection order
  const unlocked = ref([1]);        // era ids
  const achievements = ref([]);     // achievement ids
  const completionShown = ref(false);

  // ----- session-only state -----
  const pendingUnlock = ref(null);  // era id unlocked by the last collect, toasted after the modal closes

  // ----- persistence -----
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      started.value = !!s.started;
      collected.value = Array.isArray(s.collected) ? s.collected : [];
      unlocked.value = Array.isArray(s.unlocked) && s.unlocked.length ? s.unlocked : [1];
      achievements.value = Array.isArray(s.achievements) ? s.achievements : [];
      completionShown.value = !!s.completionShown;
    }
  } catch (_) { /* private mode or blocked storage: run in memory */ }

  watch(
    [started, collected, unlocked, achievements, completionShown],
    () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          started: started.value, collected: collected.value, unlocked: unlocked.value,
          achievements: achievements.value, completionShown: completionShown.value,
        }));
      } catch (_) { /* ignore */ }
    },
    { deep: true },
  );

  // ----- getters -----
  const total = KEYS.length;
  const count = computed(() => collected.value.length);
  const isComplete = computed(() => count.value === total);

  const keyById = id => KEYS.find(k => k.id === id);
  const eraById = id => ERAS.find(e => e.id === id);
  const isCollected = id => collected.value.includes(id);
  const isUnlocked = eraId => unlocked.value.includes(eraId);
  const eraKeys = eraId => KEYS.filter(k => k.era === eraId);
  const eraCollectedCount = eraId => eraKeys(eraId).filter(k => isCollected(k.id)).length;
  const eraCleared = eraId => eraCollectedCount(eraId) === eraKeys(eraId).length;
  const hasAchievement = id => achievements.value.includes(id);

  /**
   * What opens a locked era: the first locked era on the way to it (`blocked`), the open era
   * before that to collect in (`from`), and the sentence that says how many keys it takes. The
   * lock notice and a locked key's screen-reader label both use it. Null for an open era.
   */
  function lockHint(eraId) {
    const blocked = ERAS.find(e => e.id <= eraId && !isUnlocked(e.id));
    const from = blocked && eraById(blocked.id - 1);
    if (!from) return null;
    const have = eraCollectedCount(from.id);
    const left = Math.max(1, UNLOCK_AT - have);
    const keys = have === 0 ? `${UNLOCK_AT} keys` : left === 1 ? 'one more key' : `${left} more keys`;
    return { blocked, from, sentence: `Collect ${keys} in Era ${from.numeral} to unlock Era ${blocked.numeral}.` };
  }

  /** 'collected' | 'press' | 'locked' */
  const keyState = key => (isCollected(key.id) ? 'collected' : isUnlocked(key.era) ? 'press' : 'locked');
  const canOpen = id => { const k = keyById(id); return !!k && isUnlocked(k.era); };

  // ----- actions -----
  function award(id) {
    if (!achievements.value.includes(id)) achievements.value.push(id);
  }

  function start() {
    if (started.value) return;
    started.value = true;
    award('anyKey');
  }

  /** Collects a key. Returns the era id it unlocked, or null. */
  function collect(id) {
    const key = keyById(id);
    if (!key || isCollected(id) || !isUnlocked(key.era)) return null;

    collected.value.push(id);
    if (collected.value.length === 1) award('firstPress');

    let unlockedEra = null;
    const next = key.era + 1;
    if (eraById(next) && !isUnlocked(next) && eraCollectedCount(key.era) >= UNLOCK_AT) {
      unlocked.value.push(next);
      unlockedEra = next;
      pendingUnlock.value = next;
    }
    if (eraCleared(key.era)) award(`era${key.era}`);
    if (isComplete.value) award('fullSet');
    return unlockedEra;
  }

  function consumePendingUnlock() {
    const era = pendingUnlock.value;
    pendingUnlock.value = null;
    return era;
  }

  function markCompletionShown() { completionShown.value = true; }

  function reset() {
    collected.value = [];
    unlocked.value = [1];
    achievements.value = ['anyKey'];
    completionShown.value = false;
    pendingUnlock.value = null;
    started.value = false;   // back to the start screen: the router's guard shows it until any key is pressed
  }

  /** Caption under the ✓ COLLECTED button, e.g. "+1 · 1 of 4 in Era I · one more unlocks Era II" */
  function collectedCaption(key) {
    const era = eraById(key.era);
    const n = eraCollectedCount(key.era);
    const size = eraKeys(key.era).length;
    const next = eraById(key.era + 1);
    let tail = '';
    if (n === size) tail = ` · Era ${era.numeral} cleared`;
    else if (next && pendingUnlock.value === next.id) tail = ` · Era ${next.numeral} unlocked`;
    else if (next && !isUnlocked(next.id)) {
      const left = UNLOCK_AT - n;
      tail = ` · ${left === 1 ? 'one more unlocks' : `${left} more unlock`} Era ${next.numeral}`;
    }
    return `+1 · ${n} of ${size} in Era ${era.numeral}${tail}`;
  }

  return {
    started, collected, unlocked, achievements, completionShown, pendingUnlock,
    total, count, isComplete,
    keyById, eraById, isCollected, isUnlocked, eraKeys, eraCollectedCount, eraCleared, hasAchievement, keyState, canOpen, lockHint,
    start, collect, consumePendingUnlock, markCompletionShown, reset, collectedCaption,
  };
});
