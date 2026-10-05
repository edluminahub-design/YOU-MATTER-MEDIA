import { PAGE } from '@/data/site'
import PageHeader from '@/components/PageHeader'
import PageWrapper from '@/components/PageWrapper'
import Portfolio from '@/components/Portfolio'

const TRAITS = ['Clarity of thought.', 'Strength of identity.', 'Precision of execution.']

// Sat beside the section title on the single-page site; it keeps that place.
const traits = (
  <>
    <p className="text-sm font-semibold text-[var(--color-ink-soft)]">Every project reflects:</p>
    <ul className="mt-4">
      {TRAITS.map((t) => (
        <li
          key={t}
          className="border-t border-[var(--color-rule)] py-3 text-lg font-bold italic text-[var(--color-accent)] last:border-b"
        >
          {t}
        </li>
      ))}
    </ul>
  </>
)

export default function WorkPage() {
  return (
    <PageWrapper page={PAGE.work}>
      <PageHeader page={PAGE.work} aside={traits} />
      <Portfolio />
    </PageWrapper>
  )
}
