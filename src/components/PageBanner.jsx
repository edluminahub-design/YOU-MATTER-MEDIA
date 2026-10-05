import Reveal from './Reveal'
import TransitionLink from './TransitionLink'

/**
 * The centred title band at the top of every inner page: the page's name,
 * large, with a short trail back home beneath it.
 *
 * The name is a paragraph, not a heading — each page's h1 is the line that
 * follows in PageHeader, and a page keeps a single h1.
 */
export default function PageBanner({ page }) {
  return (
    <section
      aria-label={`${page.label} page`}
      className="border-b border-[var(--color-rule)] bg-[var(--color-shell)] pb-8 sm:pb-10"
      style={{ paddingTop: 'calc(var(--nav-h) + clamp(1.5rem, 4vw, 2.75rem))' }}
    >
      <div className="shell flex flex-col items-center text-center">
        <Reveal
          as="p"
          variant="title"
          className="display text-[clamp(2.75rem,7vw,5.5rem)] text-[var(--color-ink)]"
        >
          {page.label}
          <span className="text-[var(--color-accent)]">.</span>
        </Reveal>

        <Reveal as="nav" aria-label="Breadcrumb" delay={160} className="mt-4">
          <ol className="flex items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.22em]">
            <li>
              <TransitionLink
                to="/"
                className="link-draw text-[var(--color-ink-soft)] transition-colors duration-300 hover:text-[var(--color-accent)]"
              >
                Home
              </TransitionLink>
            </li>
            <li aria-hidden="true" className="h-px w-8 bg-[var(--color-accent)]" />
            <li aria-current="page" className="text-[var(--color-accent)]">
              {page.label}
            </li>
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
