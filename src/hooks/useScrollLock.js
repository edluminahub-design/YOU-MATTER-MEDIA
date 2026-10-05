import { useEffect } from 'react'

/**
 * Freezes page scroll while an overlay is open.
 *
 * The previous inline value is restored rather than cleared, so a modal opened
 * from inside the mobile menu cannot leave the page unscrollable when it
 * closes.
 */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [active])
}

/**
 * Lifts the lock immediately, without waiting for React to commit and run the
 * effect cleanup.
 *
 * An in-page anchor inside a locked overlay is otherwise swallowed: the browser
 * handles the click — and tries to scroll — while `overflow: hidden` is still
 * on the body, so the jump silently does nothing. Callers close the overlay in
 * the same handler, and the effect cleanup that follows is a harmless no-op.
 */
export function releaseScrollLock() {
  document.body.style.overflow = ''
}
