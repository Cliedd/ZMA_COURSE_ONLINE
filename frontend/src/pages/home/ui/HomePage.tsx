import { HomeHero } from './HomeHero'
import { AboutSection } from './AboutSection'
import { ProgrammesByLevelSection } from './ProgrammesByLevelSection'
import { DepartmentsSection } from './DepartmentsSection'
import { FeaturedCourses } from './FeaturedCourses'
import { AudienceStrip } from './AudienceStrip'
import { DisciplinesListSection } from './DisciplinesListSection'
import { WhyChooseUsSection } from './WhyChooseUsSection'
import { TeachersPreviewSection } from './TeachersPreviewSection'
import { QuoteBannerSection } from './QuoteBannerSection'
import { FAQSection } from './FAQSection'
import { SignupCounterSection } from './SignupCounterSection'
import { LaunchCountdownSection } from './LaunchCountdownSection'
import { FinalCtaSection } from './FinalCtaSection'

export function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HomeHero />
      <SignupCounterSection />
      <LaunchCountdownSection />
      <AboutSection />
      <ProgrammesByLevelSection />
      <DepartmentsSection />
      <FeaturedCourses />
      <AudienceStrip />
      <DisciplinesListSection />
      <WhyChooseUsSection />
      <TeachersPreviewSection />
      <QuoteBannerSection />
      <FAQSection />
      <FinalCtaSection />
    </div>
  )
}
