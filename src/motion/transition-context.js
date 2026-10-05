import { createContext, useContext } from 'react'

/**
 * Page-transition state, shared by the provider, links and page wrapper.
 *
 * phase
 *   boot    first visit; the loader is covering the page
 *   idle    nothing moving; the current page is live
 *   cover   the panel is rising over the outgoing page
 *   swap    the panel is fully closed and the route is changing underneath it
 *   reveal  the panel is clearing; the incoming page plays its entrance
 */
export const TransitionContext = createContext({
  phase: 'idle',
  target: null,
  go: () => {},
})

export function usePageTransition() {
  return useContext(TransitionContext)
}

/** Pages hold their entrance while something is still covering them. */
export function isPageReady(phase) {
  return phase === 'idle' || phase === 'reveal'
}
