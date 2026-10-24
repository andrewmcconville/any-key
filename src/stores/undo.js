import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

/**
 * Undo for the design tools. Every store with knobs hands its reactive state to `track`; from
 * then on each change to one of the state's keys becomes a step that `undo` takes back, newest
 * first. Steps made in the same tick merge (Reset all is one step), and steps to the same key
 * within COALESCE_MS merge too, so a slider drag that fires dozens of input events is one step
 * back to where the drag began. The windows' host turns ⌘Z / Ctrl+Z into `undo` while a window
 * is open (PanelHost.vue). Like the knobs themselves, nothing here persists.
 */
const COALESCE_MS = 1000;
const MAX_STEPS = 200;
const clone = v => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const useUndoStore = defineStore('undo', () => {
  const stack = [];           // { key, restores: [fn], t }, oldest first; not reactive
  const depth = ref(0);       // how many steps there are, for anything that wants to show it
  let restoring = false;
  let tickEntry = null;       // the entry this tick's records merge into
  let tickAdopted = false;    // tickEntry is an earlier step this tick joined by the same-key rule

  function record(key, restore) {
    if (restoring) return;
    const now = performance.now();
    let entry = tickEntry;
    if (entry && tickAdopted && entry.key !== key) {
      // The tick is changing more than one key (a Reset all), so it is a step of its own after all:
      // take back the restore it added to the earlier step and start fresh with both.
      const first = entry.restores.pop();
      entry = { key: null, restores: [first], t: now };
      stack.push(entry);
      tickEntry = entry;
      tickAdopted = false;
    }
    if (!entry) {
      const last = stack[stack.length - 1];
      if (last && last.key === key && now - last.t < COALESCE_MS) { entry = last; tickAdopted = true; }
    }
    if (entry) {
      if (entry.key !== key) entry.key = null;   // a mixed step never merges with a later single one
      entry.restores.push(restore);
      entry.t = now;
    } else {
      entry = { key, restores: [restore], t: now };
      stack.push(entry);
      tickAdopted = false;
    }
    if (stack.length > MAX_STEPS) stack.shift();
    if (!tickEntry) { tickEntry = entry; queueMicrotask(() => { tickEntry = null; tickAdopted = false; }); }
    depth.value = stack.length;
  }

  /** Take the newest step back. Returns false when there is nothing to undo. */
  function undo() {
    const entry = stack.pop();
    if (!entry) return false;
    depth.value = stack.length;
    restoring = true;
    try { for (let i = entry.restores.length - 1; i >= 0; i--) entry.restores[i](); }
    finally { restoring = false; }
    return true;
  }

  /**
   * Record every change to the top-level keys of `state` (a reactive object) as undo steps under
   * `id`. `after` runs once a step has been restored, for a store that applies its state by hand
   * rather than through a watcher.
   */
  function track(id, state, after) {
    let prev = clone(state);
    watch(state, () => {
      if (!restoring) {
        for (const k of new Set([...Object.keys(prev), ...Object.keys(state)])) {
          if (same(prev[k], state[k])) continue;
          const was = clone(prev[k]);
          const had = k in prev;
          record(`${id}:${k}`, () => {
            if (had) state[k] = clone(was); else delete state[k];
            after?.();
          });
        }
      }
      prev = clone(state);
    }, { deep: true, flush: 'sync' });   // sync, so a restore is seen while `restoring` is still set
  }

  return { depth, record, undo, track };
});
