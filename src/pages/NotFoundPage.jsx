import { NOT_FOUND } from '@/data/site'
import PageHeader from '@/components/PageHeader'
import PageWrapper from '@/components/PageWrapper'
import Reveal from '@/components/Reveal'
import TransitionLink from '@/components/TransitionLink'

export default function NotFoundPage() {
  return (
    <PageWrapper page={NOT_FOUND}>
      <PageHeader page={NOT_FOUND} />
      <Reveal className="shell pb-28">
        <TransitionLink to="/" className="btn btn-ink">
          Back to Home
        </TransitionLink>
      </Reveal>
    </PageWrapper>
  )
}
