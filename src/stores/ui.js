import { defineStore } from 'pinia';
import { ref } from 'vue';

const TOAST_MS = 2200;

export const useUiStore = defineStore('ui', () => {
  const toast = ref({ open: false, text: '', eraId: null });
  const scrollRequest = ref({ eraId: 1, n: 0 });   // n bumps so repeated requests re-trigger watchers
  const eraInView = ref(1);
  const boardScrolled = ref(false);
  const flight = ref(null);        // a key's cap on its way to the HUD gauge (see KeyFlight.vue), or null
  let timer = null;
  let flights = 0;

  function scrollToEra(eraId) {
    scrollRequest.value = { eraId, n: scrollRequest.value.n + 1 };
  }

  function showToast(text, eraId) {
    clearTimeout(timer);
    toast.value = { open: true, text, eraId };
    timer = setTimeout(dismissToast, TOAST_MS);
  }

  /** Hides the toast and scrolls the board to the era it announced. */
  function dismissToast() {
    clearTimeout(timer);
    const eraId = toast.value.eraId;
    toast.value = { ...toast.value, open: false };
    if (eraId) scrollToEra(eraId);
  }

  function hideToast() {
    clearTimeout(timer);
    toast.value = { ...toast.value, open: false };
  }

  /**
   * Send a key's cap from `from` (the collect button's DOMRect) up to the gauge. The gauge keeps
   * showing `countBefore` until the cap lands, so the count moves on the strike, not the press.
   */
  function launchFlight(from, legend, countBefore) {
    flight.value = { n: ++flights, from: { x: from.left, y: from.top, w: from.width, h: from.height }, legend, countBefore };
  }
  function landFlight(n) { if (flight.value?.n === n) flight.value = null; }

  return { toast, scrollRequest, eraInView, boardScrolled, flight, scrollToEra, showToast, dismissToast, hideToast, launchFlight, landFlight };
});
