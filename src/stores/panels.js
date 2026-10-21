import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

const STORAGE_KEY = 'any-key/panels/v1';

/**
 * Floating panels: windows that sit above the whole app, can be dragged around, and stack like
 * desktop windows (the last one touched comes to the front). Only id, position and open state
 * live here; what a panel shows is its own component's business (see components/PanelHost.vue).
 */
export const usePanelsStore = defineStore('panels', () => {
  const panels = reactive({});     // id → { open, x, y, z }
  const topZ = ref(1);

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    // Restore in the saved stacking order so the panel that was on top comes back on top.
    const entries = Object.entries(saved).filter(([, p]) => p && typeof p === 'object');
    entries.sort((a, b) => (Number(a[1].z) || 0) - (Number(b[1].z) || 0));
    for (const [id, p] of entries) {
      panels[id] = { open: !!p.open, x: Number(p.x) || 0, y: Number(p.y) || 0, z: ++topZ.value };
    }
  } catch (_) { /* ignore */ }

  let saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = null;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(panels)); } catch (_) { /* ignore */ }
  }
  // Dragging calls move() at pointer rate; persist once it settles, and flush if the page goes away.
  function saveSoon() {
    if (!saveTimer) saveTimer = setTimeout(save, 250);
  }
  if (typeof window !== 'undefined') window.addEventListener('pagehide', () => { if (saveTimer) save(); });

  const get = id => panels[id] ?? null;
  const isOpen = id => !!panels[id]?.open;

  function open(id, { x = 24, y = 72 } = {}) {
    if (!panels[id]) panels[id] = { open: false, x, y, z: 0 };
    panels[id].open = true;
    focus(id);
    save();
  }

  function close(id) {
    if (panels[id]) panels[id].open = false;
    save();
  }

  /** Bring a panel to the front. */
  function focus(id) {
    if (!panels[id]) return;
    panels[id].z = ++topZ.value;
    saveSoon();
  }

  function move(id, x, y) {
    if (!panels[id]) return;
    panels[id].x = Math.round(x);
    panels[id].y = Math.round(y);
    saveSoon();
  }

  return { panels, get, isOpen, open, close, focus, move };
});
