import { PAGE } from '@/data/site'
import PageHeader from '@/components/PageHeader'
import PageWrapper from '@/components/PageWrapper'
import Services from '@/components/Services'

export default function ServicesPage() {
  return (
    <PageWrapper page={PAGE.services}>
      <PageHeader page={PAGE.services} />
      <Services />
    </PageWrapper>
  )
}
