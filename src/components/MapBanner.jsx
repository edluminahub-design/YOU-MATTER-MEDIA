import Reveal from './Reveal'

/**
 * A full-width map strip that opens Google Maps in a new tab.
 *
 * There is no street address for the studio in the source material, so the
 * banner links to a Google Maps *search* for the business rather than a pin on
 * an invented address. The map is drawn in the site's own colours instead of
 * embedded: a live Google map would capture the click (visitors would pan it
 * rather than open Maps), and would load third-party scripts on every visit.
 */

// Google Maps URLs API search for "You Matter Media, India".
export const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=You%20Matter%20Media%2C%20India'

// City blocks for the drawing: three rows, with gaps left for the two main
// roads (y≈109 across, x≈596 down) and a park.
const ROWS = [
  { y: 16, h: 80 },
  { y: 122, h: 76 },
  { y: 224, h: 80 },
]
const COLS = [
  { x: 16, w: 112 },
  { x: 144, w: 140 },
  { x: 300, w: 96 },
  { x: 412, w: 168 },
  { x: 612, w: 120 },
  { x: 748, w: 136 },
  { x: 900, w: 96 },
  { x: 1012, w: 172 },
]
const PARK = { row: 1, col: 4 }
const BLOCKS = ROWS.flatMap((r, ri) =>
  COLS.filter((_, ci) => !(ri === PARK.row && ci === PARK.col)).map((c) => ({ ...c, ...r })),
)

function PinIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 21.5s-7-6.1-7-11.6A7 7 0 0 1 19 9.9c0 5.5-7 11.6-7 11.6Z" fill="currentColor" />
      <circle cx="12" cy="9.9" r="2.6" fill="var(--color-paper)" />
    </svg>
  )
}

function MapArt() {
  return (
    <svg
      viewBox="0 0 1200 320"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
    >
      <rect width="1200" height="320" fill="var(--color-shell)" />

      <g fill="var(--color-paper)" stroke="var(--color-rule)" strokeWidth="1">
        {BLOCKS.map((b) => (
          <rect key={`${b.x}-${b.y}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="8" />
        ))}
      </g>

      {/* park */}
      <rect
        x={COLS[PARK.col].x}
        y={ROWS[PARK.row].y}
        width={COLS[PARK.col].w}
        height={ROWS[PARK.row].h}
        rx="8"
        fill="var(--color-rule)"
        opacity="0.55"
      />

      {/* river */}
      <path
        d="M-20 262 C 150 226, 300 298, 470 262 S 780 214, 960 250 S 1150 270, 1220 240"
        fill="none"
        stroke="var(--color-accent)"
        strokeOpacity="0.13"
        strokeWidth="22"
        strokeLinecap="round"
      />

      {/* main roads */}
      <g stroke="var(--color-paper)" strokeWidth="10" strokeLinecap="round">
        <path d="M0 109 H1200" />
        <path d="M596 0 V320" />
      </g>
      <g stroke="var(--color-rule)" strokeWidth="1" strokeDasharray="5 6">
        <path d="M0 109 H1200" />
        <path d="M596 0 V320" />
      </g>

      {/* route to the pin, which sits at the centre of the drawing */}
      <path
        d="M150 212 C 300 212, 380 160, 596 160"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="3"
        strokeDasharray="1 8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function MapBanner() {
  return (
    <section aria-label="Location" className="shell pb-24 sm:pb-32">
      <Reveal variant="media" className="overflow-hidden rounded-3xl">
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="You Matter Media, India — open in Google Maps (opens in a new tab)"
          className="group relative block overflow-hidden rounded-3xl border border-[var(--color-rule)] bg-[var(--color-paper)] transition-[border-color,box-shadow] duration-500 hover:border-[var(--color-accent)]/50 hover:shadow-[0_28px_60px_-40px_rgba(255,80,58,0.6)]"
        >
          <div className="relative h-56 sm:h-72 lg:h-80">
            <MapArt />

            {/* Pin at the drawing's centre, which `slice` keeps centred at
                every width. Margins, not transforms, place it, so the pulse
                animation can own `transform`. */}
            <span aria-hidden="true" className="absolute left-1/2 top-1/2 -ml-6 -mt-12 h-12 w-12">
              <span className="map-pulse absolute bottom-[4px] left-1/2 -mb-2.5 -ml-2.5 h-5 w-5 rounded-full border-2 border-[var(--color-accent)]" />
              <PinIcon className="relative h-12 w-12 text-[var(--color-accent)] drop-shadow-[0_8px_10px_rgba(255,80,58,0.25)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5" />
            </span>
          </div>

          {/* Below the map on phones; floated over its corner from md up. */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-[var(--color-rule)] bg-[var(--color-paper)] px-5 py-4 md:absolute md:bottom-6 md:left-6 md:rounded-2xl md:border md:px-6 md:py-5 md:shadow-[0_18px_40px_-28px_rgba(255,80,58,0.55)]">
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-shell)]">
                <PinIcon className="h-5 w-5 text-[var(--color-accent)]" />
              </span>
              <span className="text-lg font-semibold leading-tight">You Matter Media &middot; India</span>
            </span>

            <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-paper)] transition-colors duration-300 group-hover:bg-[var(--color-accent-deep)]">
              Open in Google Maps
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:-translate-y-0.5"
              >
                &#8599;
              </span>
            </span>
          </div>
        </a>
      </Reveal>
    </section>
  )
}
