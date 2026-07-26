import { Skeleton } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useAdminCourses } from '@/entities/course'
import { formatPrice } from '@/shared/config/i18n'
import { computeFinanceStats } from './financeStats'
import { TopCourseRow } from './TopCourseRow'

/** Aperçu financier estimé, dérivé du catalogue de cours (pas de suivi de paiement réel). */
export function AdminFinancePage() {
  const { data, isLoading, isError } = useAdminCourses()
  const courses = data?.content ?? []
  const { totalRevenue, paidCount, freeCount, topCourses } = computeFinanceStats(courses)

  return (
    <div>
      <Breadcrumb items={[{ label: 'Administration', to: '/admin' }, { label: 'Finance' }]} />
      <div className="container py-8">
        <h1 className="font-serif text-h1 text-ink">Aperçu financier</h1>
        <p className="mt-1 font-sans text-body italic text-ink-muted">
          Estimation basée sur le catalogue. Le suivi détaillé des paiements sera ajouté ultérieurement.
        </p>

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="mt-8 border border-line bg-surface p-8 text-center">
            <p className="font-sans text-body text-danger">
              Impossible de charger les données du catalogue.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="border border-line bg-surface p-5">
                <p className="font-sans text-eyebrow text-ink-muted">Revenu potentiel (page courante)</p>
                <p className="mt-1 font-serif text-h2 text-ink">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="border border-line bg-surface p-5">
                <p className="font-sans text-eyebrow text-ink-muted">Cours payants</p>
                <p className="mt-1 font-serif text-h2 text-ink">{paidCount}</p>
              </div>
              <div className="border border-line bg-surface p-5">
                <p className="font-sans text-eyebrow text-ink-muted">Cours gratuits</p>
                <p className="mt-1 font-serif text-h2 text-ink">{freeCount}</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-serif text-h2 text-ink">Meilleurs revenus potentiels</h2>
              {topCourses.length === 0 ? (
                <div className="mt-4 border border-line bg-surface p-12 text-center">
                  <p className="font-serif text-h3 text-ink">Aucun cours dans le catalogue.</p>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {topCourses.map((item) => (
                    <TopCourseRow key={item.course.id} item={item} />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
