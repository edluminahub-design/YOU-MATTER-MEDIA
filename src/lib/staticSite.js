/**
 * Support for the shareable static package (`npm run build:static`).
 *
 * That build is opened straight from disk (file://), where three things the
 * normal build relies on are unavailable:
 *
 *   - Root-relative URLs. "/work/x.webp" points at the root of the drive, so
 *     assets are addressed relative to the page instead ("./images/work/…").
 *   - Server routes. There is no server to answer "/about", so each page is
 *     its own file ("about.html") and internal links point at those files.
 *   - Changing the address in place. Browsers refuse to rewrite a file://
 *     address to a different file, so moving between pages is a real page
 *     load. The transition bridges it: the curtain closes over the old page,
 *     the next file opens already covered, and the curtain lifts from there.
 *
 * In every other build (dev server, hosted build, tests) all of this is inert
 * and the site behaves exactly as before.
 */

export const STATIC_BUILD = import.meta.env.MODE === 'static'

/** Carries "arrived by an in-site link" across the page load. */
export const ARRIVAL_KEY = 'ymm:arrival'

/** The file a route lives in: '/' → 'index.html', '/about' → 'about.html'. */
export function pageFile(path) {
  const clean = path.replace(/^\/+|\/+$/g, '')
  return clean ? `${clean}.html` : 'index.html'
}

/** The href for an internal route. */
export function routeHref(path, isStatic = STATIC_BUILD) {
  return isStatic ? `./${pageFile(path)}` : path
}

/**
 * The URL for a file from /public. Takes a single path or a whole srcSet
 * ("/a.webp 800w, /b.webp 1600w") and rewrites every root-relative URL in it.
 */
export function asset(value, isStatic = STATIC_BUILD) {
  return isStatic ? value.replace(/(^|[\s,])\/(?!\/)/g, '$1./images/') : value
}

/** The route this file was built for, from <html data-route> in the static pages. */
export function staticRoute() {
  return document.documentElement.dataset.route || '/'
}

/**
 * How this page load began, decided once at startup:
 *
 *   arrive   an in-site link, whose curtain is still closed over the screen
 *   return   browser back/forward — the page's entrance alone, as before
 *   fresh    anything else: opened, reloaded, typed — the intro loader plays
 *
 * Always 'fresh' outside the static build, where page changes never reload.
 */
function detectEntry() {
  if (!STATIC_BUILD || typeof window === 'undefined') return 'fresh'

  let arrival = null
  try {
    arrival = JSON.parse(sessionStorage.getItem(ARRIVAL_KEY) || 'null')
    sessionStorage.removeItem(ARRIVAL_KEY)
  } catch {
    // Storage blocked: fall back to the ordinary opening.
  }
  // Only a fresh hand-off for this very page counts; a stale one (the visitor
  // left mid-transition and came back later) is ignored.
  if (arrival && arrival.to === staticRoute() && Date.now() - arrival.at < 10000) return 'arrive'

  const nav = performance.getEntriesByType?.('navigation')?.[0]
  if (nav?.type === 'back_forward') return 'return'
  return 'fresh'
}

export const ENTRY = detectEntry()

/** Leaves for another page with the curtain closed, telling it to lift it. */
export function leaveTo(path) {
  try {
    sessionStorage.setItem(ARRIVAL_KEY, JSON.stringify({ to: path, at: Date.now() }))
  } catch {
    // The next page will play the intro loader instead; nothing breaks.
  }
  window.location.href = routeHref(path, true)
}
