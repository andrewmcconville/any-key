import { defineStore } from 'pinia';
import { ref } from 'vue';

const TOAST_MS = 2200;

export const useUiStore = defineStore('ui', () => {
  const toast = ref({ open: false, text: '', eraId: null });
  const scrollRequest = ref({ eraId: 1, n: 0 });   // n bumps so repeated requests re-trigger watchers
  const eraInView = ref(1);
  const boardScrolled = ref(false);
  const boardPosition = ref(null);   // history.state.position of the bare board; overlays stack above it
  let timer = null;

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

  return { toast, scrollRequest, eraInView, boardScrolled, boardPosition, scrollToEra, showToast, dismissToast, hideToast };
});
