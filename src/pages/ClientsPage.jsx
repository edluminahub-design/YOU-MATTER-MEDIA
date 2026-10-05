import { PAGE } from '@/data/site'
import Clients from '@/components/Clients'
import PageHeader from '@/components/PageHeader'
import PageWrapper from '@/components/PageWrapper'

export default function ClientsPage() {
  return (
    <PageWrapper page={PAGE.clients}>
      <PageHeader page={PAGE.clients} />
      <Clients />
    </PageWrapper>
  )
}
