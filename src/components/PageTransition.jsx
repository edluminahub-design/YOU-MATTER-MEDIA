import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router'
import { pageFor } from '@/data/site'
import { MOTION, prefersReducedMotion } from '@/motion/config'
import { TransitionContext } from '@/motion/transition-context'
import { ENTRY, STATIC_BUILD, leaveTo } from '@/lib/staticSite'

/** Where the transition starts on this page load (see ENTRY). */
function initialPhase(reduced) {
  if (reduced) return 'idle'
  if (ENTRY === 'arrive') return 'swap' // the previous page left the curtain closed
  if (ENTRY === 'return') return 'idle'
  return 'boot'
}

/**
 * Owns every route change the site makes, and the ink curtain that hides it.
 *
 * A navigation runs cover → swap → reveal:
 *
 *   cover   the curtain rises from the bottom edge while the outgoing page
 *           drifts up and dims beneath it (the page's exit animation)
 *   swap    the curtain is fully closed; only now does the route change and
 *           the window jump to the top, so the swap itself is never seen —
 *           no blank frame, no white flash, no layout jump. It holds briefly
 *           so the destination's name, set on the curtain, can register
 *   reveal  the curtain carries on upward and off the top, and the incoming
 *           page plays its entrance as it is uncovered
 *
 * Browser back/forward bypass the curtain — the location has already changed
 * by the time we hear about it — and get the incoming page's entrance alone,
 * with scroll position restored by <ScrollRestoration>. Reduced motion
 * navigates immediately with no curtain at all.
 */
export default function PageTransition({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const navigationType = useNavigationType()
  const reduced = useMemo(prefersReducedMotion, [])

  const [phase, setPhaseState] = useState(() => initialPhase(reduced))
  // Arriving in the static package, the curtain already carries this page's name.
  const [target, setTarget] = useState(() =>
    initialPhase(reduced) === 'swap' ? (pageFor(location.pathname) ?? null) : null,
  )
  const [navCount, setNavCount] = useState(0)

  // Callbacks and timers need the phase *now*, not as of the last render.
  const phaseRef = useRef(phase)
  const setPhase = useCallback((next) => {
    phaseRef.current = next
    setPhaseState(next)
  }, [])

  const timers = useRef([])
  const later = useCallback((fn, ms) => {
    timers.current.push(setTimeout(fn, ms))
  }, [])
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  // First visit: pages hold their entrance while the opening intro covers
  // them. The intro only begins when the visitor presses Enter, so rather
  // than a timer it announces the moment the page is uncovered: when its
  // final dissolve begins (ymm:intro-reveal), or at once if it is skipped
  // (ymm:intro-skip). The homepage then becomes live and plays its entrance
  // while the intro finishes fading above it.
  useEffect(() => {
    const releaseIntro = () => {
      if (phaseRef.current === 'boot') setPhase('idle')
    }
    window.addEventListener('ymm:intro-reveal', releaseIntro)
    window.addEventListener('ymm:intro-skip', releaseIntro)
    return () => {
      window.removeEventListener('ymm:intro-reveal', releaseIntro)
      window.removeEventListener('ymm:intro-skip', releaseIntro)
    }
  }, [setPhase])

  useEffect(() => clearTimers, [clearTimers])

  // Static package only. The page's own HTML paints the curtain's colour
  // before this script runs (html.ymm-arriving); the curtain element has now
  // taken over, so hand back to the normal page background.
  useLayoutEffect(() => {
    document.documentElement.classList.remove('ymm-arriving')
  }, [])

  // Static package, arriving by an in-site link: the curtain is closed, as it
  // is at the swap. Hold, then lift it — the second half of the transition.
  useEffect(() => {
    if (phaseRef.current !== 'swap') return
    let lift
    const hold = setTimeout(() => {
      setPhase('reveal')
      lift = setTimeout(() => setPhase('idle'), MOTION.reveal)
    }, MOTION.hold)
    return () => {
      clearTimeout(hold)
      clearTimeout(lift)
    }
  }, [setPhase])

  // Static package: a page left with the curtain closed can be restored from
  // the back/forward cache still closed. Open it — back/forward get the page
  // without the curtain, as they always have.
  useEffect(() => {
    if (!STATIC_BUILD) return
    const onShow = (event) => {
      if (!event.persisted) return
      clearTimers()
      setTarget(null)
      setPhase('idle')
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [clearTimers, setPhase])

  const go = useCallback(
    (to) => {
      if (to === location.pathname) {
        // Already here: take the visitor back to the top rather than replaying
        // a transition to the page they are looking at.
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
        return
      }

      // The static package moves between files, so "navigating" means loading
      // the next one (see lib/staticSite).
      const change = STATIC_BUILD ? leaveTo : navigate

      if (reduced) {
        change(to)
        return
      }

      // One transition at a time; a second click mid-flight is ignored rather
      // than queued, so the curtain never stutters.
      if (phaseRef.current !== 'idle' && phaseRef.current !== 'boot') return

      clearTimers()
      setTarget(pageFor(to) ?? null)
      setPhase('cover')
      later(() => {
        setPhase('swap')
        change(to)
      }, MOTION.cover)
    },
    [location.pathname, reduced, navigate, clearTimers, later, setPhase],
  )

  // React to the location actually changing. Layout effect, so the jump to the
  // top happens before the browser paints the new page.
  const lastKey = useRef(location.key)
  useLayoutEffect(() => {
    if (location.key === lastKey.current) return
    lastKey.current = location.key
    setNavCount((n) => n + 1)

    if (phaseRef.current === 'swap') {
      // clearTimers first: a back/forward during the hold lands here too, and
      // must replace the pending reveal rather than schedule a second one.
      clearTimers()
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      later(() => {
        setPhase('reveal')
        later(() => setPhase('idle'), MOTION.reveal)
      }, MOTION.hold)
      return
    }

    if (navigationType === 'POP') {
      // Back/forward — possibly in the middle of one of our own transitions.
      // Abandon it: finishing would push a second entry onto the history the
      // visitor just stepped back through.
      clearTimers()
      setTarget(null)
      if (phaseRef.current !== 'boot') setPhase('idle')
    }
  }, [location.key, navigationType, clearTimers, later, setPhase])

  const value = useMemo(() => ({ phase, target, go, navCount }), [phase, target, go, navCount])

  return (
    <TransitionContext.Provider value={value}>
      {children}

      {!reduced && (
        <div
          aria-hidden="true"
          className="page-curtain"
          data-phase={phase}
          style={{ '--cover': `${MOTION.cover}ms`, '--reveal': `${MOTION.reveal}ms` }}
        >
          {target && (
            <p className="page-curtain__label">
              <span className="page-curtain__index">{target.index}</span>
              <span className="page-curtain__name">{target.label}</span>
            </p>
          )}
        </div>
      )}
    </TransitionContext.Provider>
  )
}
