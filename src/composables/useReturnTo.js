import { useRoute, useRouter } from 'vue-router';

/**
 * Overlays opened from another overlay (Menu → Stats, Completion → Stats) carry `?from=<route name>`
 * so that closing them returns to that overlay rather than to the bare board.
 */
export function useReturnTo() {
  const route = useRoute();
  const router = useRouter();

  /** Where "close" should go: the overlay named in `?from`, else the board. */
  function returnTarget() {
    const from = route.query.from;
    return typeof from === 'string' && router.hasRoute(from) ? { name: from } : { path: '/' };
  }

  /** Close this overlay, returning to wherever it was opened from. */
  const close = () => router.replace(returnTarget());

  /** Open another overlay from this one, recording this route as the place to return to. */
  const openFromHere = name => router.replace({ name, query: { from: route.name } });

  return { close, openFromHere, returnTarget };
}
