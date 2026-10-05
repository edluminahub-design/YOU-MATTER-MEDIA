import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import Preloader from '@/components/Preloader'
import { MOTION } from '@/motion/config'
import { INTRO, diveViewBox } from '@/motion/intro'

function motionPreference() {
  return {
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('opening intro', () => {
  it('starts by itself as the page opens, with no button to press', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', motionPreference)
    render(<Preloader />)

    expect(screen.queryByRole('button', { name: /^enter$/i })).not.toBeInTheDocument()
    expect(document.querySelector('.intro-stage')).toBeTruthy()
    act(() => vi.advanceTimersByTime(INTRO.us.events.at(-1).at))
    expect(document.querySelector('.intro-line--us').textContent).toContain('US')
  })

  it('clears naturally once the faster sequence completes', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', motionPreference)
    render(<Preloader />)

    expect(screen.getByRole('button', { name: /skip intro/i })).toBeVisible()
    expect(document.querySelector('.intro-stage')).toBeTruthy()
    expect(document.querySelector('.intro')).toHaveClass('intro--playing')
    expect(document.body.style.overflow).toBe('hidden')

    act(() => vi.advanceTimersByTime(MOTION.loaderGone))
    expect(screen.queryByRole('button', { name: /skip intro/i })).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })

  it('releases the page immediately when the visitor skips', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', motionPreference)
    const onSkip = vi.fn()
    window.addEventListener('ymm:intro-skip', onSkip)
    render(<Preloader />)

    fireEvent.click(screen.getByRole('button', { name: /skip intro/i }))
    expect(onSkip).toHaveBeenCalledOnce()
    expect(document.body.style.overflow).toBe('')
    expect(document.querySelector('.intro')).toHaveClass('intro--leaving')

    act(() => vi.advanceTimersByTime(420))
    expect(screen.queryByRole('button', { name: /skip intro/i })).not.toBeInTheDocument()
    window.removeEventListener('ymm:intro-skip', onSkip)
  })
})

describe('typed statements', () => {
  // What each of a statement's three lines shows right now.
  const lines = (block) =>
    [...document.querySelectorAll(`.intro-line--${block} .intro-type__line`)].map((l) =>
      l.textContent.replaceAll(String.fromCharCode(0x200b), ''),
    )
  const caretLine = (block) =>
    [...document.querySelectorAll(`.intro-line--${block} .intro-type__line`)].findIndex((l) =>
      l.querySelector('.intro-caret'),
    )

  let now = 0
  const advanceTo = (ms) => {
    act(() => vi.advanceTimersByTime(ms - now))
    now = ms
  }

  it('types YOU MATTER, then TO, then US, a line at a time', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', motionPreference)
    now = 0
    render(<Preloader />)

    const events = INTRO.us.events
    const [toReturn, usReturn] = events.filter((e) => e.kind === 'return')

    expect(lines('us')).toEqual(['', '', ''])
    expect(caretLine('us')).toBe(0)

    advanceTo(events[3].at)
    expect(lines('us')).toEqual(['YOU ', '', ''])

    advanceTo(toReturn.at - 1)
    expect(lines('us')).toEqual(['YOU MATTER', '', ''])
    expect(caretLine('us')).toBe(0)

    advanceTo(toReturn.at)
    expect(caretLine('us')).toBe(1)

    advanceTo(usReturn.at)
    expect(lines('us')).toEqual(['YOU MATTER', 'TO', ''])
    expect(caretLine('us')).toBe(2)

    advanceTo(events.at(-1).at)
    expect(lines('us')).toEqual(['YOU MATTER', 'TO', 'US'])
  })

  it('types YOU MATTER, then TO, then THE WORLD', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', motionPreference)
    now = 0
    render(<Preloader />)

    const events = INTRO.world.events
    advanceTo(events[0].at - 1)
    expect(lines('world')).toEqual(['', '', ''])

    const [toReturn, worldReturn] = events.filter((e) => e.kind === 'return')
    advanceTo(toReturn.at - 1)
    expect(lines('world')).toEqual(['YOU MATTER', '', ''])
    advanceTo(worldReturn.at - 1)
    expect(lines('world')).toEqual(['YOU MATTER', 'TO', ''])
    advanceTo(events.at(-1).at)
    expect(lines('world')).toEqual(['YOU MATTER', 'TO', 'THE WORLD'])
  })

  it('stops typing the moment the visitor skips', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', motionPreference)
    now = 0
    render(<Preloader />)

    advanceTo(INTRO.us.events[4].at)
    const before = lines('us')
    fireEvent.click(screen.getByRole('button', { name: /skip intro/i }))
    advanceTo(now + 400)
    expect(lines('us')).toEqual(before)
  })

  it('fits the typing inside the intro, before the panel lifts', () => {
    expect(INTRO.us.end).toBeLessThan(INTRO.world.in)
    expect(INTRO.world.out).toBeLessThan(INTRO.lift)
    expect(MOTION.loaderLift).toBe(INTRO.lift)
  })
})

describe('finale', () => {
  it('holds the large YOU MATTER for a second, then dives in before dissolving', () => {
    // About 1s fully visible, once the ~0.43s settle has finished.
    expect(INTRO.zoom.at - INTRO.logo.at).toBeGreaterThanOrEqual(1400)
    // The home page is revealed as the dive ends, not before it starts.
    expect(INTRO.reveal.at).toBeGreaterThan(INTRO.zoom.at + INTRO.zoom.dur / 2)
    expect(INTRO.reveal.at).toBeLessThanOrEqual(INTRO.zoom.at + INTRO.zoom.dur)
    expect(MOTION.loaderGone).toBeGreaterThanOrEqual(INTRO.reveal.at + INTRO.reveal.dur)
  })

  it('zooms by redrawing the logo: from the whole wordmark to one stroke at the centre', () => {
    const box = (p) => diveViewBox(p, 262.67, 100).split(' ').map(Number)
    expect(box(0).map((n) => +n.toFixed(6))).toEqual([0, 0, 262.67, 100])
    const [x, y, w, h] = box(1)
    expect(262.67 / w).toBeCloseTo(180) // 180× in
    // The view ends centred on the target point inside the "M".
    expect(x + w / 2).toBeCloseTo(146.17)
    expect(y + h / 2).toBeCloseTo(22.9)
    // And it only ever moves inward.
    const widths = [0, 0.2, 0.4, 0.6, 0.8, 1].map((p) => box(p)[2])
    expect(widths).toEqual([...widths].sort((a, b) => b - a))
  })

  it('gives scrolling back as the dissolve begins, while the intro still covers the page', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', motionPreference)
    render(<Preloader />)

    act(() => vi.advanceTimersByTime(INTRO.reveal.at - 1))
    expect(document.body.style.overflow).toBe('hidden')
    act(() => vi.advanceTimersByTime(1))
    expect(document.body.style.overflow).toBe('')
    expect(document.querySelector('.intro')).toBeInTheDocument()
  })

  it('tells the page beneath the moment it is uncovered, and not before', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', motionPreference)
    const onReveal = vi.fn()
    window.addEventListener('ymm:intro-reveal', onReveal)
    render(<Preloader />)

    act(() => vi.advanceTimersByTime(INTRO.reveal.at - 1))
    expect(onReveal).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onReveal).toHaveBeenCalledOnce()
    window.removeEventListener('ymm:intro-reveal', onReveal)
  })
})
