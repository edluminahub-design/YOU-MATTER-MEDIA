import { useEffect, useRef, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import Footer from './Footer'
import Navbar from './Navbar'
import PageTransition from './PageTransition'
import Preloader from './Preloader'
import SocialRail from './SocialRail'
import { STATIC_BUILD } from '@/lib/staticSite'

/**
 * Announces each client-side page change to screen readers. The page wrapper
 * also moves focus to the new heading; this covers readers that do not voice
 * focus moves onto non-interactive elements.
 */
function RouteAnnouncer() {
  const { pathname } = useLocation()
  const [message, setMessage] = useState('')
  // Compared by path rather than by "first run", so React's double-invoked
  // effects in development cannot announce the page the visitor landed on.
  const announced = useRef(pathname)

  useEffect(() => {
    if (pathname === announced.current) return
    announced.current = pathname
    // After the page wrapper has set the title for the new route.
    const t = setTimeout(() => setMessage(document.title), 100)
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <p aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </p>
  )
}

/**
 * The frame every page renders inside: the persistent navbar and footer, the
 * transition system, the first-visit loader, and scroll restoration for
 * back/forward. The routed page itself fills <main>.
 */
export default function Layout() {
  return (
    <PageTransition>
      <a
        href="#main"
        className="btn btn-accent sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110]"
      >
        Skip to content
      </a>

      <Preloader />
      <Navbar />

      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>

      <Footer />

      {/* Fixed to the right edge; stays through scrolling and page changes. */}
      <SocialRail />

      {/* Forward navigations start at the top; back/forward return to where
          the visitor was on that page. The static package's pages are real
          page loads, where the browser already does this itself. */}
      {!STATIC_BUILD && <ScrollRestoration />}
      <RouteAnnouncer />
    </PageTransition>
  )
}
