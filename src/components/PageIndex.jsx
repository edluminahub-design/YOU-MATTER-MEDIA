import { NAV } from '@/data/site'
import Reveal from './Reveal'
import TransitionLink from './TransitionLink'

/**
 * The home page's way onward: one row per page, each carrying a line that
 * already opens that page, so the index previews the site in its own words.
 */
export default function PageIndex() {
  const pages = NAV.filter((p) => p.key !== 'home')

  return (
    <section className="shell pb-24 sm:pb-32">
      <Reveal>
        <p className="eyebrow text-[var(--color-accent)]">Explore</p>
      </Reveal>

      <ul className="mt-8 border-b border-[var(--color-rule)]">
        {pages.map((p, i) => (
          <Reveal as="li" key={p.key} delay={i * 70} className="border-t border-[var(--color-rule)]">
            <TransitionLink
              to={p.path}
              className="group relative isolate grid grid-cols-[auto_1fr_auto] items-center gap-x-5 gap-y-1 py-6 sm:grid-cols-12 sm:gap-6 sm:py-8"
            >
              {/* Hover wash rising from the row's bottom edge — the same
                  gesture as the service rows, so the site reads as one. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 origin-bottom scale-y-0 bg-[var(--color-shell)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100"
              />

              <span className="text-xs font-semibold tracking-[0.22em] text-[var(--color-accent)] sm:col-span-1 sm:pl-3">
                {p.index}
              </span>

              <span className="display text-[clamp(2.25rem,6vw,4.25rem)] transition-[transform,color] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 group-hover:text-[var(--color-accent)] sm:col-span-4">
                {p.label}
              </span>

              <span className="col-span-3 col-start-2 text-base leading-relaxed text-[var(--color-ink-soft)] sm:col-span-6 sm:col-start-auto">
                {p.teaser ?? p.lede}
              </span>

              <span
                aria-hidden="true"
                className="row-start-1 col-start-3 flex h-11 w-11 items-center justify-center justify-self-end rounded-full border border-[var(--color-rule)] transition-[transform,background-color,border-color,color] duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-45 group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-[var(--color-paper)] sm:col-span-1 sm:col-start-12 sm:mr-3"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </TransitionLink>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
