import { onMounted, onUnmounted, ref } from 'vue';

/**
 * 1rem in CSS px on this screen, so a design-tool readout shows what the visitor actually sees.
 * The root font-size follows the viewport, so it is re-measured on resize and rotation.
 */
export function useRemPx() {
  const remPx = ref(0);
  const measure = () => { remPx.value = parseFloat(getComputedStyle(document.documentElement).fontSize) || 0; };
  measure();
  onMounted(() => window.addEventListener('resize', measure));
  onUnmounted(() => window.removeEventListener('resize', measure));
  const px = rem => (rem * remPx.value).toFixed(1);
  return { remPx, px };
}
