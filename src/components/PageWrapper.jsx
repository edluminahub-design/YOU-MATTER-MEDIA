import { useEffect, useRef } from 'react'
import { isPageReady, usePageTransition } from '@/motion/transition-context'

const ORIGIN = 'https://youmattermedia.in'

function setHeadLink(selector, attr, value) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/**
 * The outer element of every page.
 *
 * It translates the transition phase into one `data-state` the stylesheet
 * reads:
 *
 *   waiting   something still covers the page — entrances are held
 *   leaving   the curtain is rising over this page — the exit plays
 *   ready     the page is uncovered — entrances run
 *
 * Holding entrances in CSS rather than delaying the IntersectionObserver
 * means elements already on screen are *marked* revealed while covered but
 * only *animate* once the curtain is gone, so a page's opening is always
 * visible rather than finished behind the panel.
 *
 * It also keeps the document title and canonical URL in step with the route,
 * and after a client-side navigation moves focus to the page's heading so
 * screen readers announce where the visitor has arrived.
 */
export default function PageWrapper({ page, className = '', children }) {
  const { phase, navCount } = usePageTransition()
  const ref = useRef(null)
  const focused = useRef(false)

  const state = phase === 'cover' ? 'leaving' : isPageReady(phase) ? 'ready' : 'waiting'

  useEffect(() => {
    document.title = page.title
    if (page.path) {
      setHeadLink('link[rel="canonical"]', 'href', `${ORIGIN}${page.path}`)
      setHeadLink('meta[property="og:url"]', 'content', `${ORIGIN}${page.path}`)
      setHeadLink('meta[property="og:title"]', 'content', page.title)
    }
  }, [page])

  useEffect(() => {
    // Only after the visitor has navigated within the site: on a first visit
    // focus belongs to the browser, and moving it would scroll or jump.
    if (state !== 'ready' || navCount === 0 || focused.current) return
    focused.current = true
    ref.current?.querySelector('h1')?.focus({ preventScroll: true })
  }, [state, navCount])

  return (
    <div ref={ref} className={`page ${className}`} data-state={state} data-page={page.key}>
      {children}
    </div>
  )
}
