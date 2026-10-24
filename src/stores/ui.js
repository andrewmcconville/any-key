import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ERAS } from '../data/content';
import { UNLOCK_AT, useGameStore } from './game';

export const useUiStore = defineStore('ui', () => {
  // The notice under the top HUD (ToastBanner): an era unlocking, or why a key is locked. Nothing
  // times it out. It stays until the visitor taps GO TO ERA, reaches that era on their own, opens
  // an overlay, or dismisses it; it never moves the board by itself.
  const toast = ref({ open: false, text: '', sub: '', eraId: null });
  const scrollRequest = ref({ eraId: 1, n: 0 });   // n bumps so repeated requests re-trigger watchers
  const eraInView = ref(1);
  const flight = ref(null);        // a key's cap on its way to the HUD gauge (see KeyFlight.vue), or null
  let queued = null;               // a notice waiting for the cap in the air to land
  let flights = 0;

  function scrollToEra(eraId) {
    scrollRequest.value = { eraId, n: scrollRequest.value.n + 1 };
  }

  /**
   * Show a notice: `text` in caps, an optional `sub` line, and `eraId`, the era its GO TO button
   * goes to. While a collected key's cap is still in the air the notice waits for it to land, so
   * the unlock reads as what the strike on the gauge earned.
   */
  function showToast({ text, sub = '', eraId = null }) {
    const notice = { open: true, text, sub, eraId };
    if (flight.value) { queued = notice; return; }
    queued = null;
    toast.value = notice;
  }

  /** The visitor's GO TO ERA: hide the notice and scroll the board to its era. */
  function goToToastEra() {
    const { eraId } = toast.value;
    hideToast();
    if (eraId) scrollToEra(eraId);
  }

  function hideToast() {
    queued = null;
    toast.value = { ...toast.value, open: false };
  }

  /**
   * Why a key is locked, as a notice: the first locked era on the way to it, and how many more
   * keys in the era before that open it. Its GO TO goes to the era to collect in.
   */
  function explainLock(eraId) {
    const game = useGameStore();
    const era = ERAS.find(e => e.id === eraId);
    const blocked = ERAS.find(e => e.id <= eraId && !game.isUnlocked(e.id));
    const from = blocked && ERAS.find(e => e.id === blocked.id - 1);
    if (!era || !from) return;
    const have = game.eraCollectedCount(from.id);
    const left = Math.max(1, UNLOCK_AT - have);
    const keys = have === 0 ? `${UNLOCK_AT} keys` : left === 1 ? 'one more key' : `${left} more keys`;
    showToast({
      text: `ERA ${era.numeral} · LOCKED`,
      sub: `Collect ${keys} in Era ${from.numeral} to unlock Era ${blocked.numeral}.`,
      eraId: from.id,
    });
  }

  /**
   * Send a key's cap from `from` (the collect button's DOMRect) up to the gauge. The gauge keeps
   * showing `countBefore` until the cap lands, so the count moves on the strike, not the press.
   */
  function launchFlight(from, legend, countBefore) {
    flight.value = { n: ++flights, from: { x: from.left, y: from.top, w: from.width, h: from.height }, legend, countBefore };
  }
  function landFlight(n) {
    if (flight.value?.n !== n) return;
    flight.value = null;
    if (queued) { toast.value = queued; queued = null; }
  }

  return { toast, scrollRequest, eraInView, flight, scrollToEra, showToast, goToToastEra, hideToast, explainLock, launchFlight, landFlight };
});
