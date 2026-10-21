// Briefly outline a set of elements so a design-tool slider shows what it is about to change:
// the outline holds for `hold` ms, then fades over the .token-flash transition (see styles.css).
const HOLD_MS = 1000;
const FADE_MS = 500;

let current = [];
let timers = [];

function clear() {
  timers.forEach(clearTimeout);
  timers = [];
  current.forEach(el => el.classList.remove('token-flash', 'token-flash--fading'));
  current = [];
}

export function flashElements(elements) {
  clear();
  current = [...elements];
  current.forEach(el => el.classList.add('token-flash'));
  timers.push(setTimeout(() => current.forEach(el => el.classList.add('token-flash--fading')), HOLD_MS));
  timers.push(setTimeout(clear, HOLD_MS + FADE_MS));
}

/**
 * Every visible element outside the design-tool panels whose computed font-size is `px`, ignoring
 * ones that only inherit it from a parent that already matched, so one outline wraps each use.
 */
export function elementsWithFontSize(px, { within = document.body, exclude = '.panel-host' } = {}) {
  const out = [];
  const tolerance = 0.05;
  const sizeOf = el => parseFloat(getComputedStyle(el).fontSize);
  for (const el of within.querySelectorAll('*')) {
    if (el.closest(exclude)) continue;
    if (Math.abs(sizeOf(el) - px) > tolerance) continue;
    const parent = el.parentElement;
    if (parent && parent !== within && Math.abs(sizeOf(parent) - px) <= tolerance) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    out.push(el);
  }
  return out;
}
