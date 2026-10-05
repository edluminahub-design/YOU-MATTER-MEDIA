/**
 * The intro's audio, synthesised with Web Audio — no audio files to load.
 *
 * Two sounds, on two buses of one mix:
 *
 *   typing  a quiet keystroke for every character typed (key()). Each is two
 *           short layers: a filtered-noise tick (the key cap) over a low,
 *           fast knock (the key bottoming out). Line returns are silent, so
 *           the sound pauses exactly when the typing does.
 *   zoom    one continuous cinematic rise for the final dive into
 *           "YOU MATTER" (zoom()): an air whoosh whose pitch and level climb
 *           with the zoom, a soft low tonal swell beneath it, and a gentle low
 *           impact as the zoom peaks — then a reverb tail that carries it,
 *           fading, into the home page.
 *
 * Mix: the zoom bus sits well above the typing bus, and both pass through a
 * gentle limiter so no combination can clip. Every level change is a ramp;
 * nothing starts or stops with a click.
 *
 * Browsers allow sound only after the visitor has interacted with the page.
 * So nothing is created until that is allowed: if the visitor has already
 * interacted, the sound starts with the intro; otherwise from their first
 * tap, click or key press (unlock()). Until then every call is a silent
 * no-op — no blocked-playback errors or warnings, and the intro looks
 * exactly the same with or without sound.
 */
import { INTRO } from '@/motion/intro'

const TYPING_LEVEL = 0.28 // clearly audible, while leaving room for the finale
const ZOOM_LEVEL = 0.9 // the finale's sound leads the mix

// The zoom's shape, in seconds from its start, taken from the intro timeline
// so sound and picture share one plan.
const Z = INTRO.zoom.dur / 1000 // the dive
const R = (INTRO.reveal.at - INTRO.zoom.at) / 1000 // the dissolve into the home page begins
const E = R + INTRO.reveal.dur / 1000 // the home page is fully shown

/** Pink-ish noise (Paul Kellet's filter): softer and airier than white. */
function pinkNoise(ctx, seconds) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate)
  const d = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.969 * b2 + w * 0.153852
    b3 = 0.8665 * b3 + w * 0.3104856
    b4 = 0.55 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.016898
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
    b6 = w * 0.115926
  }
  return buffer
}

function whiteNoise(ctx, seconds) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate)
  const d = buffer.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return buffer
}

/** A short, dark stereo room: decaying noise, for the zoom's tail. */
function roomImpulse(ctx, seconds = 1.6) {
  const len = Math.ceil(ctx.sampleRate * seconds)
  const ir = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3.2
  }
  return ir
}

/** A gain that follows a list of [time, level] points with exponential ramps. */
function envelope(ctx, points, out) {
  const g = ctx.createGain()
  const [first, ...rest] = points
  g.gain.setValueAtTime(Math.max(first[1], 0.0001), first[0])
  for (const [t, v] of rest) g.gain.exponentialRampToValueAtTime(Math.max(v, 0.0001), t)
  g.connect(out)
  return g
}

/**
 * One keystroke at `when` into `out`. kind: 'key' | 'space'. Pitch varies by
 * a few percent per key: the same sound throughout, but never a metronome.
 */
export function scheduleKey(ctx, out, noise, kind, when) {
  const soft = kind === 'space'
  const vary = 0.94 + Math.random() * 0.12

  const tick = ctx.createBufferSource()
  tick.buffer = noise
  tick.playbackRate.value = vary
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = (soft ? 1500 : 2600) * vary
  band.Q.value = 0.8
  tick.connect(band).connect(
    envelope(ctx, [[when, 0.0001], [when + 0.0015, soft ? 0.5 : 0.8], [when + 0.03, 0.0001]], out),
  )
  tick.start(when)
  tick.stop(when + 0.05)

  const knock = ctx.createOscillator()
  knock.frequency.setValueAtTime((soft ? 150 : 210) * vary, when)
  knock.frequency.exponentialRampToValueAtTime(70, when + 0.05)
  knock.connect(envelope(ctx, [[when, 0.0001], [when + 0.002, soft ? 0.35 : 0.45], [when + 0.047, 0.0001]], out))
  knock.start(when)
  knock.stop(when + 0.06)
}

/**
 * The finale's sound, starting at `t0` on the audio clock, into `out`.
 * Returns the time at which it has fully faded away.
 */
export function scheduleZoom(ctx, out, t0) {
  const at = (s) => t0 + s

  // A little room around the whoosh and the impact, for a finished tail.
  const room = ctx.createConvolver()
  room.buffer = roomImpulse(ctx)
  const wet = ctx.createGain()
  wet.gain.value = 0.3
  room.connect(wet).connect(out)
  const bus = ctx.createGain()
  bus.connect(out)
  bus.connect(room)

  // 1. The whoosh: airy noise through a band that sweeps up with the zoom,
  //    swelling to its peak just as the zoom does, then settling away.
  const air = ctx.createBufferSource()
  air.buffer = pinkNoise(ctx, E + 1)
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.Q.value = 0.7
  band.frequency.setValueAtTime(180, at(0))
  band.frequency.exponentialRampToValueAtTime(900, at(Z * 0.62))
  band.frequency.exponentialRampToValueAtTime(5200, at(Z))
  band.frequency.exponentialRampToValueAtTime(1100, at(E))
  air.connect(band).connect(
    envelope(
      ctx,
      [[at(0), 0.003], [at(Z * 0.3), 0.012], [at(Z * 0.7), 0.1], [at(Z - 0.03), 0.5], [at(R + 0.25), 0.12], [at(E + 0.35), 0.0001]],
      bus,
    ),
  )
  air.start(at(0))
  air.stop(at(E + 0.4))

  // 2. The swell: a soft open fifth beneath the air, rising slightly in
  //    pitch as the camera pushes in. Gives the rise a note, not just noise.
  const tone = ctx.createBiquadFilter()
  tone.type = 'lowpass'
  tone.frequency.value = 900
  const toneGain = envelope(ctx, [[at(0), 0.002], [at(Z * 0.5), 0.02], [at(Z), 0.13], [at(E + 0.2), 0.0001]], bus)
  tone.connect(toneGain)
  for (const [hz, level] of [[110, 1], [164.81, 0.7], [220, 0.35]]) {
    const osc = ctx.createOscillator()
    osc.frequency.setValueAtTime(hz, at(0))
    osc.frequency.exponentialRampToValueAtTime(hz * 1.12, at(Z))
    const g = ctx.createGain()
    g.gain.value = level
    osc.connect(g).connect(tone)
    osc.start(at(0))
    osc.stop(at(E + 0.3))
  }

  // 3. The landing: a soft, deep impact as "YOU MATTER" fills the screen,
  //    with a breath of air on top — felt more than heard, then decaying.
  const hit = at(Z - 0.02)
  const boom = ctx.createOscillator()
  boom.frequency.setValueAtTime(72, hit)
  boom.frequency.exponentialRampToValueAtTime(38, hit + 0.9)
  boom.connect(envelope(ctx, [[hit, 0.0001], [hit + 0.025, 0.42], [hit + 1.1, 0.0001]], bus))
  boom.start(hit)
  boom.stop(hit + 1.15)

  const breath = ctx.createBufferSource()
  breath.buffer = whiteNoise(ctx, 0.8)
  const soft = ctx.createBiquadFilter()
  soft.type = 'lowpass'
  soft.frequency.setValueAtTime(2400, hit)
  soft.frequency.exponentialRampToValueAtTime(300, hit + 0.6)
  breath.connect(soft).connect(envelope(ctx, [[hit, 0.0001], [hit + 0.01, 0.12], [hit + 0.6, 0.0001]], bus))
  breath.start(hit)
  breath.stop(hit + 0.65)

  return hit + 1.15 + 1.6 // the impact, plus the room's tail
}

export function createIntroSound() {
  let ctx = null
  let master = null
  let typing = null
  let zoom = null
  let keyNoise = null
  let stopped = false
  let zoomed = false
  let endsAt = 0 // audio-clock time the last scheduled sound has faded by

  // `userActivation` says whether the browser will let audio start. Where the
  // API is missing we wait for a gesture, which always allows it.
  const allowed = () => Boolean(globalThis.navigator?.userActivation?.hasBeenActive)

  function start() {
    if (ctx) return true
    const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext
    if (!Ctx) return false
    try {
      ctx = new Ctx()
    } catch {
      return false
    }

    // Both buses → master → a gentle limiter → speakers.
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -6
    limiter.knee.value = 6
    limiter.ratio.value = 12
    limiter.attack.value = 0.003
    limiter.release.value = 0.25
    limiter.connect(ctx.destination)
    master = ctx.createGain()
    master.connect(limiter)
    typing = ctx.createGain()
    typing.gain.value = TYPING_LEVEL
    typing.connect(master)
    zoom = ctx.createGain()
    zoom.gain.value = ZOOM_LEVEL
    zoom.connect(master)

    keyNoise = whiteNoise(ctx, 0.06)
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    return true
  }

  const ready = () => !stopped && (ctx || (allowed() && start())) && ctx.state === 'running'

  return {
    /** Call from a user gesture: this is the moment browsers permit sound. */
    unlock() {
      if (stopped || !start()) return
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    },

    /** One keystroke, now. */
    key(kind = 'key') {
      if (!ready()) return
      const when = ctx.currentTime + 0.004
      scheduleKey(ctx, typing, keyNoise, kind, when)
      endsAt = Math.max(endsAt, when + 0.1)
    },

    /**
     * The finale's sound, starting `inSeconds` from now — scheduled on the
     * audio clock in one go, so it lands on the zoom to the sample. Plays at
     * most once; returns whether it was scheduled.
     */
    zoom(inSeconds = 0) {
      if (zoomed) return true
      if (!ready()) return false
      zoomed = true
      endsAt = Math.max(endsAt, scheduleZoom(ctx, zoom, ctx.currentTime + Math.max(inSeconds, 0.005)))
      return true
    },

    /** Skip: fade everything out quickly (never a click), then shut down. */
    stop() {
      if (stopped) return
      stopped = true
      if (!ctx) return
      const now = ctx.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(master.gain.value, now)
      master.gain.linearRampToValueAtTime(0, now + 0.18)
      const c = ctx
      setTimeout(() => c.close().catch(() => {}), 260)
      ctx = null
    },

    /** The intro is gone: let anything still sounding finish, then shut down. */
    release() {
      if (!ctx) return
      stopped = true
      const c = ctx
      const left = Math.max(0, endsAt - c.currentTime)
      setTimeout(() => c.close().catch(() => {}), left * 1000 + 100)
      ctx = null
    },
  }
}
