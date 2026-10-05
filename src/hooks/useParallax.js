import { useEffect, useRef } from 'react'

const DESKTOP = '(min-width: 1024px)'
const REDUCED = '(prefers-reduced-motion: reduce)'

/**
 * Drifts an element against the scroll by writing `--py` on it, which the
 * `.parallax` utility reads into a transform.
 *
 * Deliberately narrow: one shared rAF-throttled scroll listener per element,
 * writing a single custom property, and only on pointer-width screens where
 * there is room for the movement to read as depth. On phones and for anyone
 * who has asked for reduced motion the listener never attaches, `--py` stays
 * unset, and the element sits still — which is also why the travel is capped:
 * an uncapped parallax on a long page drifts elements far enough to change the
 * layout people are trying to read.
 *
 * @param {number} strength  px of counter-travel per viewport scrolled.
 */
export function useParallax(strength = 60) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof matchMedia === 'undefined') return
    if (!matchMedia(DESKTOP).matches || matchMedia(REDUCED).matches) return

    let frame = 0

    const update = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      // -1 when the element sits a viewport below the fold, +1 a viewport
      // above it; 0 when it is centred.
      const progress = (window.innerHeight / 2 - (rect.top + rect.height / 2)) / window.innerHeight
      const clamped = Math.max(-1, Math.min(1, progress))
      node.style.setProperty('--py', `${(clamped * strength).toFixed(2)}px`)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      node.style.removeProperty('--py')
    }
  }, [strength])

  return ref
}
