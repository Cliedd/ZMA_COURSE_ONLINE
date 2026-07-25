import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCourses } from '@/entities/course'
import { CourseGrid } from '@/widgets/course-grid'

/** Formations phares : les mieux notées, réelles, tirées du catalogue. */
export function FeaturedCourses() {
  const { t } = useTranslation()
  const { data, isLoading } = useCourses({ size: 12 })

  const featured = (data?.content ?? [])
    .filter((c) => (c.rating ?? 0) >= 4.5)
    .slice(0, 3)

  // Rien à mettre en avant et chargement terminé : on masque la section (pas de trou).
  if (!isLoading && featured.length === 0) return null

  return (
    <section className="bg-paper">
      <div className="container py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-gold-ink">
              {t('home.featuredEyebrow')}
            </p>
            <h2 className="mt-3 font-serif text-h1 text-ink">{t('home.featuredTitle')}</h2>
          </div>
          <Link to="/catalogue" className="hidden min-h-touch items-center gap-2 font-sans text-sm font-semibold text-gold-ink hover:underline md:inline-flex">
            {t('home.featuredAll')} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-10">
          <CourseGrid courses={featured} loading={isLoading} skeletonCount={3} />
        </div>
      </div>
    </section>
  )
}
