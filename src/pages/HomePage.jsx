import { PAGE } from '@/data/site'
import BrandStatement from '@/components/BrandStatement'
import Hero from '@/components/Hero'
import PageIndex from '@/components/PageIndex'
import PageWrapper from '@/components/PageWrapper'

export default function HomePage() {
  return (
    <PageWrapper page={PAGE.home}>
      <Hero />
      <BrandStatement />
      <PageIndex />
    </PageWrapper>
  )
}
