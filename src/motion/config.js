import { INTRO } from './intro'

/**
 * Timings for everything that moves between pages.
 *
 * The CSS side of the motion system (easings, reveal variants) lives in
 * index.css; these are the durations JavaScript has to wait on, kept in one
 * place so the page transition, the loader and the CSS keyframes that mirror
 * them cannot drift apart. Each value here is also written into index.css —
 * change one and change the other.
 */
export const MOTION = {
  /** The first-visit intro starts lifting after its full typed sequence… */
  loaderLift: INTRO.lift,
  /** …and leaves the DOM once the upward reveal has cleared the viewport. */
  loaderGone: INTRO.gone,

  /** Panel rises to cover the outgoing page. (Also the page exit in index.css.) */
  cover: 480,
  /** Closed panel holds so the destination's name registers. */
  hold: 140,
  /** Panel clears the incoming page. */
  reveal: 620,
}

/** True when the visitor has asked for less motion, or the environment can't say. */
export function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
