import Reveal from './Reveal'

/** Grid footprint per span, so the gallery has rhythm rather than 13 equal tiles. */
const SPAN = {
  wide: 'sm:col-span-2 lg:col-span-4',
  tall: 'sm:col-span-1 lg:col-span-2',
  square: 'sm:col-span-1 lg:col-span-2',
}

const RATIO = {
  wide: '16 / 10',
  tall: '3 / 4',
  square: '1 / 1',
}

export default function PortfolioCard({ project, onOpen, index }) {
  const { cover } = project

  return (
    <li className={`${SPAN[project.span] ?? SPAN.square} min-w-0`}>
      <button
        type="button"
        onClick={() => onOpen(project)}
        className="group block w-full text-left"
        aria-label={`View project: ${project.title}`}
      >
        {/* The frame opens upward while the picture settles from 1.14 to 1:1 —
            the same reveal the hero plates use, so the page has one grammar
            for imagery arriving. */}
        <Reveal
          variant="media"
          delay={(index % 3) * 90}
          className="relative overflow-hidden rounded-2xl bg-[var(--color-shell)]"
          style={{ aspectRatio: RATIO[project.span] ?? RATIO.square }}
        >
          <img
            src={cover.src}
            srcSet={cover.srcSet}
            sizes="(min-width: 1024px) 45vw, (min-width: 640px) 50vw, 100vw"
            width={cover.width}
            height={cover.height}
            alt={cover.alt}
            // The first two tiles are usually in view when the section is
            // reached; everything after is deferred.
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
          />

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[var(--color-accent-2)]/0 transition-colors duration-500 group-hover:bg-[var(--color-accent-2)]/50"
          />

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-[transform,opacity] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100"
          >
            <span className="btn btn-paper !px-5 !py-2.5 text-xs">View Project</span>
          </span>
        </Reveal>

        {/* Titles wrap rather than truncate: "Nest — Stationery System" was
            being cut to "Nest — Stationery Syste…" in a two-up grid, which
            loses the one thing the card has to say. */}
        <Reveal delay={(index % 3) * 90 + 90} className="mt-4 flex items-baseline justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-balance text-lg font-semibold leading-tight transition-colors duration-300 group-hover:text-[var(--color-accent)]">
              {project.title}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{project.client}</p>
          </div>

          <span className="shrink-0 whitespace-nowrap rounded-full border border-[var(--color-rule)] px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--color-ink-soft)] transition-colors duration-300 group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent)]">
            {project.category}
          </span>
        </Reveal>
      </button>
    </li>
  )
}
