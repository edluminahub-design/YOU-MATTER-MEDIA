import { useEffect, useRef, useState } from 'react'
import { NAV } from '@/data/site'
import { releaseScrollLock, useScrollLock } from '@/hooks/useScrollLock'
import Logo from './Logo'
import TransitionLink from './TransitionLink'

export default function Navbar() {
  // The bar condenses once the visitor has committed to scrolling: it loses
  // height, picks up a blurred paper backing and a hairline. Flipped at 24px
  // rather than at the fold so the change feels like a response to scrolling
  // rather than a separate event further down the page.
  const [condensed, setCondensed] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // While the mobile panel is open the page behind it must not scroll.
  useScrollLock(open)

  // Escape closes the panel and hands focus back to the toggle — otherwise the
  // menu is a trap on a phone.
  useEffect(() => {
    if (!open) return

    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // A link in the panel closes it before the transition starts. The lock is
  // released synchronously — not on the next render — so the transition's
  // reset to the top of the new page is not swallowed by `overflow: hidden`.
  const closeMenu = () => {
    releaseScrollLock()
    setOpen(false)
  }

  const backed = condensed || open

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-[var(--color-ink)] transition-[height,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[var(--ease-ui)] ${
          backed
            ? 'border-b border-[var(--color-rule)] bg-[color-mix(in_srgb,var(--color-paper)_82%,transparent)] shadow-[0_1px_24px_-12px_rgba(255,80,58,0.4)] backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent'
        }`}
        style={{ height: backed ? 'var(--nav-h-scrolled)' : 'var(--nav-h)' }}
      >
        <nav aria-label="Primary" className="shell flex h-full items-center justify-between gap-4">
          <TransitionLink
            to="/"
            className="shrink-0 transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
            onNavigate={closeMenu}
          >
            {/* Steps down with the bar when it condenses on scroll. */}
            <Logo
              className={`block w-auto transition-[height] duration-500 ease-[var(--ease-ui)] ${
                backed ? 'h-10 sm:h-11' : 'h-11 sm:h-14'
              }`}
            />
            <span className="sr-only">You Matter Media — home</span>
          </TransitionLink>

          <ul className="hidden items-center gap-9 lg:flex">
            {NAV.map((item) => (
              <li key={item.key}>
                {/* NavLink sets aria-current="page" on the active route; the
                    .nav-link styles key off that attribute. */}
                <TransitionLink nav to={item.path} className="nav-link text-sm font-medium tracking-wide">
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <TransitionLink
              to="/contact"
              className="btn btn-accent hidden !px-6 !py-3 text-sm sm:inline-flex"
            >
              Let&rsquo;s Talk
            </TransitionLink>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            >
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
              <span aria-hidden="true" className="relative block h-4 w-6">
                <span
                  className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-300 ease-[var(--ease-out-expo)] ${
                    open ? 'top-1/2 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 block h-0.5 w-6 bg-current transition-opacity duration-200 ${
                    open ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`absolute left-0 block h-0.5 w-6 bg-current transition-transform duration-300 ease-[var(--ease-out-expo)] ${
                    open ? 'top-1/2 -rotate-45' : 'top-full'
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile panel — a sibling of the header, not a child of it.
          The condensed header carries a backdrop-filter, and a backdrop-filter
          makes an element the containing block for its fixed-position
          descendants: nested inside, this panel resolved `top`/`bottom`
          against the 68px bar and collapsed to zero height. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 z-40 overflow-y-auto bg-[var(--color-paper)] lg:hidden"
        style={{ top: backed ? 'var(--nav-h-scrolled)' : 'var(--nav-h)' }}
      >
        <ul className="shell flex flex-col py-6">
          {NAV.map((item) => (
            <li key={item.key} className="border-b border-[var(--color-rule)] last:border-0">
              <TransitionLink
                nav
                to={item.path}
                onNavigate={closeMenu}
                className="nav-link-lg display flex items-baseline gap-4 py-5 text-[2.5rem]"
              >
                {/* Ordinal is ornament. Without aria-hidden the link announces
                    as "04 Work", which is noise in a six-item menu. */}
                <span
                  aria-hidden="true"
                  className="font-sans text-xs font-semibold tracking-widest text-[var(--color-accent)]"
                >
                  {item.index}
                </span>
                {item.label}
              </TransitionLink>
            </li>
          ))}
        </ul>

        <div className="shell pb-10">
          <TransitionLink to="/contact" onNavigate={closeMenu} className="btn btn-accent w-full">
            Let&rsquo;s Talk
          </TransitionLink>
        </div>
      </div>
    </>
  )
}
