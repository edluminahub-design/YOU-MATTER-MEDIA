import { Link, NavLink, useLocation } from 'react-router'
import { usePageTransition } from '@/motion/transition-context'
import { STATIC_BUILD, routeHref } from '@/lib/staticSite'

/**
 * An internal link that travels through the page transition.
 *
 * It still renders a real <a href>, so the destination is crawlable and
 * middle-click / cmd-click / "open in new tab" behave exactly as the browser
 * intends — only a plain left click is intercepted.
 *
 * `nav` renders a NavLink, which sets aria-current="page" on the active route
 * and accepts a className function for the active style. `onNavigate` runs
 * before the transition starts: menus and dialogs use it to close themselves.
 *
 * In the static package the href is the page's file ("./about.html"), so the
 * link also works opened in a new tab, and the active page is marked the same
 * way NavLink marks it.
 */
export default function TransitionLink({ to, nav = false, onNavigate, onClick, target, ...rest }) {
  const { go } = usePageTransition()
  const { pathname } = useLocation()

  const handleClick = (event) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (target && target !== '_self') return

    event.preventDefault()
    onNavigate?.()
    go(to)
  }

  if (STATIC_BUILD) {
    const { className, ...props } = rest
    const active = nav && pathname === to
    const classes = typeof className === 'function' ? className({ isActive: active }) : className
    return (
      <a
        href={routeHref(to)}
        target={target}
        onClick={handleClick}
        aria-current={active ? 'page' : undefined}
        className={nav && active ? [classes, 'active'].filter(Boolean).join(' ') : classes}
        {...props}
      />
    )
  }

  const Component = nav ? NavLink : Link
  return (
    <Component
      to={to}
      target={target}
      onClick={handleClick}
      // The home route would otherwise match every path as a prefix.
      {...(nav && to === '/' ? { end: true } : null)}
      {...rest}
    />
  )
}
