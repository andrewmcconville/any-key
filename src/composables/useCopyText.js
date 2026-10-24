import { ref } from 'vue';

/**
 * Copy text to the clipboard with a short "Copied" state for the button that triggered it.
 * Falls back to a selection copy where the async clipboard is unavailable (insecure context,
 * permission denied).
 */
export function useCopyText(feedbackMs = 1500) {
  const copied = ref(false);
  let timer = null;

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => { copied.value = false; }, feedbackMs);
  }

  return { copied, copy };
}
