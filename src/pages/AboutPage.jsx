import { PAGE } from '@/data/site'
import AboutUs from '@/components/AboutUs'
import PageHeader from '@/components/PageHeader'
import PageWrapper from '@/components/PageWrapper'
import Philosophy from '@/components/Philosophy'
import VisionMission from '@/components/VisionMission'
import WhatDefinesUs from '@/components/WhatDefinesUs'

export default function AboutPage() {
  return (
    <PageWrapper page={PAGE.about}>
      <PageHeader page={PAGE.about} size="lg" />
      <AboutUs />
      <WhatDefinesUs />
      <VisionMission />
      <Philosophy />
    </PageWrapper>
  )
}
