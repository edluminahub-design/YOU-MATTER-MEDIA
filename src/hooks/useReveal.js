import { useEffect, useRef } from 'react'

/**
 * Releases an element's reveal offset once it scrolls into view.
 *
 * One observer is shared by every caller: a page this long would otherwise
 * create fifty of them. Elements are unobserved as soon as they have played,
 * so the callback cost falls to zero as the visitor scrolls down.
 */

let observer = null

function getObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.dataset.revealed = 'true'
        observer.unobserve(entry.target)
      }
    },
    // Fire a little before the element's top edge reaches the viewport bottom,
    // so the motion reads as "already settling" rather than "popping in".
    { threshold: 0, rootMargin: '0px 0px -12% 0px' },
  )
  return observer
}

export function useReveal() {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const io = getObserver()
    // No IntersectionObserver (or a test environment without it): show the
    // content immediately rather than leaving it stuck at opacity 0.
    if (!io) {
      node.dataset.revealed = 'true'
      return
    }

    io.observe(node)
    return () => io.unobserve(node)
  }, [])

  return ref
}
