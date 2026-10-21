import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui';

/**
 * Overlays form a stack on top of the board, and they live in browser history: every overlay is
 * opened with a history push and closed with a history back, so the × button, Esc and the
 * browser or phone back gesture all do the same thing and land wherever the overlay was opened
 * from, even if that was another overlay. The ui store remembers the history position of the
 * board underneath (set by the router's afterEach); if there is nothing of ours to go back to,
 * as after a direct link to an overlay, close falls back to replacing the route with the board.
 */
export function useOverlayNav() {
  const router = useRouter();
  const ui = useUiStore();

  const position = () => window.history.state?.position ?? 0;
  const depth = () => (ui.boardPosition == null ? 0 : position() - ui.boardPosition);

  /** Open another overlay on top of this one. */
  const open = (name, params) => router.push({ name, params });

  // router.back() and router.go() return nothing and navigate asynchronously (via popstate), so
  // callers that need to act once the overlay is gone get a promise that resolves on the next
  // completed navigation, with a timeout in case nothing navigates at all.
  function settled() {
    return new Promise(resolve => {
      const stop = router.afterEach(() => { stop(); clearTimeout(timer); resolve(); });
      const timer = setTimeout(() => { stop(); resolve(); }, 1000);
    });
  }
  function go(delta) {
    const done = settled();
    router.go(delta);
    return done;
  }

  /** Close this overlay: back to whatever was underneath. Resolves once that has happened. */
  function close() {
    if (depth() > 0) return go(-1);
    return router.replace({ path: '/' });
  }

  /** Close every overlay at once and land on the board (Reset confirm, Start over). */
  function closeAll() {
    const d = depth();
    if (d > 0) return go(-d);
    return router.replace({ path: '/' });
  }

  return { open, close, closeAll };
}
