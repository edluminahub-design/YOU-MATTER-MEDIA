import { PAGE } from '@/data/site'
import Contact from '@/components/Contact'
import MapBanner from '@/components/MapBanner'
import PageHeader from '@/components/PageHeader'
import PageWrapper from '@/components/PageWrapper'
import WhyChooseUs from '@/components/WhyChooseUs'

export default function ContactPage() {
  return (
    <PageWrapper page={PAGE.contact}>
      <PageHeader page={PAGE.contact} size="lg" />
      <Contact />
      <MapBanner />
      <WhyChooseUs />
    </PageWrapper>
  )
}
