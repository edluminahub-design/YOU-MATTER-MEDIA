import { SERVICES } from '@/data/site'
import Reveal from './Reveal'
import TransitionLink from './TransitionLink'

/**
 * Services as a list of full-width rows rather than a card grid.
 *
 * Seven cards in a 3-column grid leaves a ragged last row and shrinks each
 * service to a thumbnail. As rows they read top-to-bottom like a contents page,
 * the numbering stays meaningful, and each row has space for its description at
 * every breakpoint — which is what "extremely easy to read on mobile" needs.
 *
 * Set on red: this and Why Choose are the page's two red bands, and the
 * alternation is what gives a long scroll its rhythm.
 */
export default function Services() {
  return (
    <section
      id="services"
      className="on-band bg-[var(--color-band)] py-24 text-[var(--color-paper)] sm:py-32 lg:py-40"
    >
      <div className="shell">
        {/* "What We Do" / "Our Services" and the lede now open the Services
            page, in its PageHeader; the list follows directly. */}
        <ul>
          {SERVICES.map((s, i) => (
            <Reveal
              as="li"
              key={s.no}
              delay={i * 55}
              className="group relative border-t border-[var(--color-paper)]/15 last:border-b"
            >
              {/* Hover wash. Sits behind the row content and grows from the
                  bottom edge, so the row lifts rather than blinking. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-[var(--color-paper)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100"
              />

              <div className="relative grid gap-3 px-2 py-8 transition-colors duration-500 group-hover:text-[var(--color-ink)] sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:px-4">
                <span className="text-sm font-semibold tracking-widest text-[var(--color-accent-lift)] transition-colors duration-500 group-hover:text-[var(--color-accent)] sm:col-span-1">
                  {s.no}
                </span>

                {/* h2: the page title is the h1, and each service is a
                    top-level item beneath it. */}
                <h2 className="text-[clamp(1.5rem,3.6vw,2.5rem)] font-semibold leading-tight transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2 sm:col-span-5">
                  {s.name}
                </h2>

                <p className="max-w-prose text-base leading-relaxed opacity-80 sm:col-span-6">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-14">
          <TransitionLink to="/contact" className="btn btn-paper">
            Start a conversation
          </TransitionLink>
        </Reveal>
      </div>
    </section>
  )
}
