import { useEffect, useRef, useState } from 'react'
import { LOGO } from '@/data/logo'
import { MOTION, prefersReducedMotion } from '@/motion/config'
import { INTRO, INTRO_LINES, diveViewBox, typedState } from '@/motion/intro'
import { ENTRY } from '@/lib/staticSite'
import { createIntroSound } from '@/lib/introSound'
import Logo from './Logo'

// Every time in the sequence, handed to the stylesheet on the intro panel so
// the CSS fades and the typing below run on one timeline (see motion/intro).
const TIMELINE = {
  '--us-in': `${INTRO.us.in}ms`,
  '--us-out': `${INTRO.us.out}ms`,
  '--and-at': `${INTRO.and.at}ms`,
  '--world-in': `${INTRO.world.in}ms`,
  '--world-out': `${INTRO.world.out}ms`,
  '--promise-at': `${INTRO.promise.at}ms`,
  '--logo-at': `${INTRO.logo.at}ms`,
  '--zoom-at': `${INTRO.zoom.at}ms`,
  '--reveal-at': `${INTRO.reveal.at}ms`,
  '--reveal-ms': `${INTRO.reveal.dur}ms`,
}

// A zero-width space: gives a not-yet-typed line its full height.
const EMPTY_LINE = String.fromCharCode(0x200b)

/**
 * One typed statement: three stacked lines filled in keystroke by keystroke,
 * with a caret on the line being typed. Each line keeps its height while
 * empty, so the block never jumps as lines fill.
 */
function TypedStatement({ block, applied, className }) {
  const { counts, caretLine, finished } = typedState(block, applied)
  const idle = applied === 0 || finished

  return (
    <p className={`intro-line intro-type ${className}`}>
      {INTRO_LINES[block].map((line, i) => {
        const Tag = line.style === 'em' ? 'em' : 'span'
        return (
          <Tag key={i} className={`intro-type__line${line.style === 'display' ? ' display' : ''}`}>
            <span className="intro-type__text">
              {line.text.slice(0, counts[i]) || EMPTY_LINE}
              {caretLine === i && <span className={`intro-caret${idle ? ' intro-caret--idle' : ''}`} />}
            </span>
          </Tag>
        )
      })}
    </p>
  )
}

/**
 * First-visit brand intro. Its message sequence mirrors the supplied opening
 * reference and ends on a large "YOU MATTER", which the camera then dives
 * into until a cream stroke fills the screen and dissolves into the
 * already-rendered homepage beneath it. The words use normal DOM text and the existing vector
 * logo; a subtle cinematic zoom on the stage is the camera, not a new design.
 * The two "You matter" statements are typed line by line with a caret and a
 * quiet key sound (lib/introSound), both driven by motion/intro's keystroke
 * list.
 *
 * It plays only on a fresh website load. During the sequence it owns the
 * viewport and locks document scrolling, then restores interaction as soon as
 * the panel is gone. Visitors who prefer reduced motion skip it entirely.
 * Skip pauses every intro animation so nothing keeps running underneath, and
 * stops the typing and its sound.
 */
export default function Preloader() {
  // In the static package every page is its own file; the loader belongs to
  // opening the site, not to each move between its pages (see ENTRY).
  const [done, setDone] = useState(() => prefersReducedMotion() || ENTRY !== 'fresh')
  const [skipped, setSkipped] = useState(false)
  // Keystrokes applied so far, per statement.
  const [typed, setTyped] = useState({ us: 0, world: 0 })
  // The final dissolve into the home page has begun.
  const [revealing, setRevealing] = useState(false)

  useEffect(() => {
    if (done) return
    const timer = setTimeout(() => setDone(true), MOTION.loaderGone)
    const reveal = setTimeout(() => {
      setRevealing(true)
      // Tells the page beneath that it is being uncovered (PageTransition).
      window.dispatchEvent(new Event('ymm:intro-reveal'))
    }, INTRO.reveal.at)
    return () => {
      clearTimeout(timer)
      clearTimeout(reveal)
    }
  }, [done])

  // Scrolling is locked for the sequence and released the moment the dissolve
  // starts: the scrollbar comes back while the intro still covers the page,
  // so the page never visibly shifts as it is revealed.
  useEffect(() => {
    if (done || skipped || revealing) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [done, skipped, revealing])

  useEffect(() => {
    if (!skipped) return undefined
    const timer = setTimeout(() => setDone(true), 420)
    return () => clearTimeout(timer)
  }, [skipped])

  // The intro's audio (lib/introSound): one mix for the whole intro, shared by
  // the typing and the zoom below. Browsers allow sound only after the
  // visitor interacts; the first tap, click or key press turns it on. When
  // the intro ends, whatever is still sounding (the zoom's tail) is allowed
  // to fade out on its own; Skip fades it out at once instead.
  const soundRef = useRef(null)
  useEffect(() => {
    if (done) return undefined
    const sound = createIntroSound()
    soundRef.current = sound
    const unlock = () => sound.unlock()
    window.addEventListener('pointerdown', unlock)
    window.addEventListener('keydown', unlock)
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      soundRef.current = null
      sound.release()
    }
  }, [done])

  // The typing. Each keystroke shows its character and plays its sound in the
  // same callback, so what is seen and heard land together. Line returns are
  // silent: the sound pauses exactly when the typing does. Skip (or the
  // intro ending) clears the pending keystrokes.
  useEffect(() => {
    if (done || skipped) return undefined

    const start = performance.now()
    const timers = []

    for (const block of ['us', 'world']) {
      INTRO[block].events.forEach((event, i) => {
        timers.push(
          setTimeout(() => {
            setTyped((prev) => (prev[block] > i ? prev : { ...prev, [block]: i + 1 }))
            // A background tab runs timers late and all at once; the letters
            // catch up, but only a keystroke on time makes a sound.
            const onTime = performance.now() - start - event.at < 90
            if (event.kind !== 'return' && onTime) soundRef.current?.key(event.kind)
          }, event.at),
        )
      })
    }

    return () => timers.forEach(clearTimeout)
  }, [done, skipped])

  // The final zoom into "YOU MATTER". Each frame moves the logo's viewBox in
  // towards one of its strokes, so the browser redraws the vector letters at
  // the new size — crisp at every step, never an enlarged, blurring picture.
  const stageRef = useRef(null)
  useEffect(() => {
    if (done || skipped || typeof requestAnimationFrame !== 'function') return undefined
    const logo = stageRef.current?.querySelector('.intro-logo')
    if (!logo) return undefined

    // Timed from the intro's own CSS clock (its dissolve animation, which
    // started with the intro), so the zoom and the dissolve that ends it can
    // never drift apart — however late this effect happened to run.
    const intro = stageRef.current.parentElement
    const cssClock = () =>
      intro.getAnimations?.().find((a) => a.animationName === 'ymm-intro-dissolve')?.currentTime
    const start = performance.now()
    let frame = 0
    let voiced = false
    const step = () => {
      const elapsed = cssClock() ?? performance.now() - start
      // The zoom's sound is handed to the audio clock ahead of time, timed to
      // start on the zoom's first frame. If sound only becomes available just
      // after the zoom has begun it may still join; any later and it stays
      // silent rather than arrive out of step with the picture.
      if (!voiced && elapsed < INTRO.zoom.at + 120) {
        voiced = soundRef.current?.zoom((INTRO.zoom.at - elapsed) / 1000) ?? false
      }
      const p = (elapsed - INTRO.zoom.at) / INTRO.zoom.dur
      if (p > 0) logo.setAttribute('viewBox', diveViewBox(p, LOGO.width, LOGO.height))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    // Idle until shortly before the zoom, then run a frame loop for its length.
    const wait = setTimeout(() => {
      frame = requestAnimationFrame(step)
    }, INTRO.zoom.at - 300)

    return () => {
      clearTimeout(wait)
      cancelAnimationFrame(frame)
    }
  }, [done, skipped])

  const skipIntro = () => {
    if (skipped) return
    soundRef.current?.stop()
    setSkipped(true)
    window.dispatchEvent(new Event('ymm:intro-skip'))
  }

  if (done) return null

  const classes = ['intro intro--playing fixed inset-0 z-[100] overflow-hidden']
  if (skipped) classes.push('intro--leaving')

  return (
    <div className={classes.join(' ')} style={TIMELINE}>
      <div ref={stageRef} className="intro-stage" aria-hidden="true">
        <TypedStatement block="us" applied={typed.us} className="intro-line--us" />
        <p className="intro-line intro-line--and">and</p>
        <TypedStatement block="world" applied={typed.world} className="intro-line--world" />
        <p className="intro-line intro-line--promise">and we make sure the world knows you</p>
        <Logo plate={false} className="intro-logo h-auto w-[min(86vw,52rem,150vh)]" />
      </div>
      <button type="button" className="intro-skip" onClick={skipIntro}>
        Skip intro
      </button>
    </div>
  )
}
