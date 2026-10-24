/**
 * Elements that can run their motion on demand carry data-replay and listen for a motion-replay
 * event (see EraDots). The design tools' Play buttons use these to run the real UI, not just a demo.
 */

/** Ask one element, or its nearest replayable parent, to run its motion. */
export function replay(el) {
  el?.closest('[data-replay]')?.dispatchEvent(new CustomEvent('motion-replay'));
}

/** Ask every replayable element on the page (or those matching `selector`) to run its motion. */
export function replayAll(selector = '') {
  document.querySelectorAll(`[data-replay]${selector}`).forEach(el => el.dispatchEvent(new CustomEvent('motion-replay')));
}
