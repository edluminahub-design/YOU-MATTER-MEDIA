/**
 * The opening intro's script: what is typed, and when everything happens.
 *
 * The two statements are typed a line at a time, like someone at a keyboard:
 * "YOU MATTER", a return, "TO", a return, then "US" / "THE WORLD". Every
 * keystroke has a time, and three things are driven from that one list — the
 * letters appearing (Preloader.jsx), the caret, and the key sound
 * (lib/introSound.js) — so they cannot drift apart. The CSS fades for the
 * other lines and the logo take their delays from here too (as --at, --in and
 * --out on the elements), and MOTION.loaderLift / loaderGone are derived from
 * the end of it.
 *
 * All times are milliseconds from the moment the intro appears.
 */

/** `em` lines use the intro's italic connector style; the rest the display face. */
export const INTRO_LINES = {
  us: [
    { text: 'YOU MATTER', style: 'display' },
    { text: 'TO', style: 'em' },
    { text: 'US', style: 'display' },
  ],
  world: [
    { text: 'YOU MATTER', style: 'display' },
    { text: 'TO', style: 'em' },
    { text: 'THE WORLD', style: 'display' },
  ],
}

// A quick, even typist. The small repeating offsets keep the rhythm from
// sounding mechanical; a space and the return between lines take a touch
// longer, as they do on a real keyboard.
const KEY_MS = 46
const UNEVEN = [0, 16, -9, 22, -5, 11, -13, 18, 3, -7, 14, -11]
const SPACE_MS = 24
const RETURN_MS = 150
const LEAD_MS = 120 // the caret shows on the empty line before the first key
const HOLD_MS = 420 // the finished statement stays up to be read
const FADE_MS = 320

/**
 * One statement's keystrokes. Each event is a character (with the running
 * count for its line) or a return that moves the caret down a line.
 */
function typeBlock(lines, appearAt) {
  const events = []
  let t = appearAt + LEAD_MS
  let n = 0

  lines.forEach((line, li) => {
    if (li > 0) {
      events.push({ at: Math.round(t), kind: 'return', line: li })
      t += RETURN_MS
    }
    for (let ci = 0; ci < line.text.length; ci++) {
      const space = line.text[ci] === ' '
      events.push({ at: Math.round(t), kind: space ? 'space' : 'key', line: li, count: ci + 1 })
      t += KEY_MS + UNEVEN[n++ % UNEVEN.length] + (space ? SPACE_MS : 0)
    }
  })

  const typed = events[events.length - 1].at
  return { in: appearAt, events, out: typed + HOLD_MS, end: typed + HOLD_MS + FADE_MS }
}

// The connecting lines keep the lengths they had; only their start times move
// to make room for the typing.
const AND_MS = 667
const PROMISE_MS = 1147

const us = typeBlock(INTRO_LINES.us, 60)
const andAt = us.end - 60
const world = typeBlock(INTRO_LINES.world, andAt + AND_MS - 80)
const promiseAt = world.end - 60
const logoAt = promiseAt + PROMISE_MS - 160

// The finale: the large "YOU MATTER" settles in (~430ms), stays up for a
// second, then the camera dives into one of its cream strokes until the
// stroke fills the screen. Near the end of the dive the intro dissolves into
// the home page — also cream — so the zoom carries straight into the site.
const LOGO_SETTLE_MS = 430
const LOGO_HOLD_MS = 1000
const ZOOM_MS = 950
const REVEAL_MS = 550
const zoomAt = logoAt + LOGO_SETTLE_MS + LOGO_HOLD_MS
const revealAt = zoomAt + Math.round(ZOOM_MS * 0.92)

export const INTRO = {
  us,
  and: { at: andAt, dur: AND_MS },
  world,
  promise: { at: promiseAt, dur: PROMISE_MS },
  logo: { at: logoAt },
  zoom: { at: zoomAt, dur: ZOOM_MS },
  reveal: { at: revealAt, dur: REVEAL_MS },
  /** The home page goes live (and plays its entrance) as the intro dissolves… */
  lift: revealAt,
  /** …and the intro leaves the DOM once it is fully transparent. */
  gone: revealAt + REVEAL_MS + 50,
}

// The dive's target: the deepest point inside the lettering (in the "M" of
// MATTER), found from the logo's outlines, and how far in the camera goes —
// far enough that this one cream stroke covers any screen.
const DIVE_POINT = { x: 146.17, y: 22.9 }
const DIVE_SCALE = 180

/**
 * The logo's viewBox at progress p (0–1) through the dive, for a logo whose
 * own viewBox is `width` × `height`. Zooming the viewBox — rather than scaling
 * a rendered picture of the logo — has the browser redraw the vector outlines
 * at every step, so the edges stay perfectly sharp all the way in.
 *
 * The scale climbs exponentially (180^(p^1.6)): steady at first, then rushing
 * in, which reads as one even push. Over the first half the view also drifts
 * so the target point ends up at the centre of the screen.
 */
export function diveViewBox(p, width, height) {
  const t = Math.min(Math.max(p, 0), 1)
  const s = DIVE_SCALE ** (t ** 1.6)
  const u = Math.min(t / 0.5, 1)
  const q = 1 - (1 - u) ** 3 // ease-out drift to centre
  const { x: px, y: py } = DIVE_POINT
  const cx = width / 2
  const cy = height / 2
  // The view scaled by s about the target, shifted by q of the way to centre.
  const x = px - (px + q * (cx - px)) / s
  const y = py - (py + q * (cy - py)) / s
  return `${x} ${y} ${width / s} ${height / s}`
}

/**
 * What a statement shows after its first `applied` events: how many
 * characters of each line are typed, and which line the caret is on.
 */
export function typedState(block, applied) {
  const counts = INTRO_LINES[block].map(() => 0)
  let caretLine = 0
  const { events } = INTRO[block]
  for (let i = 0; i < applied && i < events.length; i++) {
    const e = events[i]
    caretLine = e.line
    if (e.kind !== 'return') counts[e.line] = e.count
  }
  return { counts, caretLine, finished: applied >= events.length }
}
