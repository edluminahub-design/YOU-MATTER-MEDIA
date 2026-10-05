import { useMemo, useState } from 'react'
import { CATEGORIES, PROJECTS } from '@/data/projects'
import PortfolioCard from './PortfolioCard'
import PortfolioModal from './PortfolioModal'
import Reveal from './Reveal'

export default function Portfolio() {
  const [filter, setFilter] = useState('All')
  const [active, setActive] = useState(null)

  const visible = useMemo(
    () => (filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.category === filter)),
    [filter],
  )

  // Categories with nothing behind them would be dead buttons, so only offer
  // the ones the work actually fills.
  const tabs = useMemo(
    () => CATEGORIES.filter((c) => c === 'All' || PROJECTS.some((p) => p.category === c)),
    [],
  )

  return (
    <section id="work" className="pb-24 pt-2 sm:pb-32 lg:pb-40">
      <div className="shell">
        {/* "Selected Work" / "The Work", its lede and the three traits now
            open the Work page, in its PageHeader. */}
        <Reveal>
          <div
            role="tablist"
            aria-label="Filter work by category"
            className="no-scrollbar -mx-[clamp(1.25rem,5vw,5rem)] flex gap-2 overflow-x-auto px-[clamp(1.25rem,5vw,5rem)] pb-1"
          >
            {tabs.map((c) => {
              const selected = filter === c
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(c)}
                  className={`btn shrink-0 !px-5 !py-2.5 text-sm ${
                    selected ? 'btn-ink' : 'btn-outline'
                  }`}
                >
                  {c}
                  <span className="ml-1 text-xs opacity-60">
                    {c === 'All' ? PROJECTS.length : PROJECTS.filter((p) => p.category === c).length}
                  </span>
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* `grid-flow-dense` lets a narrow tile backfill the gap a wide tile
            leaves, which is what keeps the masonry from going ragged when a
            filter removes items. */}
        <ul
          className="mt-10 grid grid-flow-dense grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-6"
          aria-live="polite"
        >
          {visible.map((p, i) => (
            <PortfolioCard
              // Keying on filter as well as id restarts the reveal when the set
              // changes, so a filter switch reads as new content arriving.
              key={`${filter}-${p.id}`}
              project={p}
              index={i}
              onOpen={setActive}
            />
          ))}
        </ul>

        <p className="mt-10 text-sm text-[var(--color-ink-soft)]">
          Showing {visible.length} of {PROJECTS.length} projects
          {filter !== 'All' && (
            <>
              {' '}
              in <strong className="font-semibold text-[var(--color-ink)]">{filter}</strong>.{' '}
              <button
                type="button"
                onClick={() => setFilter('All')}
                className="link-draw font-semibold text-[var(--color-accent)]"
              >
                Show all
              </button>
            </>
          )}
        </p>
      </div>

      <PortfolioModal project={active} onClose={() => setActive(null)} />
    </section>
  )
}
