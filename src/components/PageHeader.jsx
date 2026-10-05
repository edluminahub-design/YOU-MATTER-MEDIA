import PageBanner from './PageBanner'
import Reveal from './Reveal'

const SIZE = {
  xl: 'text-[clamp(3.25rem,11vw,9.5rem)]',
  lg: 'text-[clamp(2.5rem,7.2vw,6.25rem)]',
}

/** A heading that ends in a full stop gets the red one the hero uses. */
function Heading({ text }) {
  if (!text.endsWith('.')) return text
  return (
    <>
      {text.slice(0, -1)}
      <span className="text-[var(--color-accent)]">.</span>
    </>
  )
}

/**
 * The opening block of every inner page.
 *
 * Its copy is the page record's own `eyebrow` / `heading` / `lede` — the
 * strings that used to open the equivalent section on the single-page site —
 * so moving to separate pages changed where those lines sit, not what they
 * say. `aside` fills the right-hand column where a page had one.
 *
 * The entrance runs top-down in one sequence: eyebrow and page index, the
 * title lifting into place, the lede, then the rule drawing across. It is the
 * same order on every page, which is what makes the pages feel like one site.
 */
export default function PageHeader({ page, size = 'xl', aside = null }) {
  return (
    <>
      {/* The centred page-name band comes first; it also clears the navbar, so
          the header below no longer needs to. */}
      <PageBanner page={page} />
      <header className="shell pb-14 pt-16 sm:pb-20 sm:pt-24">
        <Reveal>
          <p className="eyebrow text-[var(--color-accent)]">{page.eyebrow}</p>
        </Reveal>

        {!page.heading && (
          // A page without a visible title still gets a hidden h1, so it has
          // one, and so focus lands here after navigation.
          <h1 tabIndex={-1} className="sr-only">
            {page.label}
          </h1>
        )}

        {(page.heading || page.lede || aside) && (
          <div className="mt-7 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className={aside ? 'lg:col-span-7' : 'lg:col-span-11'}>
              {/* tabIndex -1: the page wrapper focuses this after a client-side
                  navigation so assistive tech announces the new page. */}
              {page.heading && (
                <Reveal
                  as="h1"
                  variant="title"
                  delay={90}
                  tabIndex={-1}
                  className={`display ${SIZE[size] ?? SIZE.xl}`}
                >
                  <Heading text={page.heading} />
                </Reveal>
              )}

              {page.lede && (
                <Reveal delay={260}>
                  <p className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
                    {page.lede}
                  </p>
                </Reveal>
              )}
            </div>

            {aside && (
              <Reveal delay={340} className="lg:col-span-4 lg:col-start-9 lg:self-end">
                {aside}
              </Reveal>
            )}
          </div>
        )}
      </header>
    </>
  )
}
