import { Skeleton } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useAdminCourses } from '@/entities/course'
import { useRevenueAnalytics, useTeacherPayouts } from '@/entities/payment'
import { formatPrice } from '@/shared/config/i18n'
import { computeFinanceStats } from './financeStats'
import { TopCourseRow } from './TopCourseRow'

/** Vraies statistiques de paiements (zma-payment) + estimation catalogue en complément (répartition par cours non trackée côté paiement). */
export function AdminFinancePage() {
  const { data, isLoading, isError } = useAdminCourses()
  const courses = data?.content ?? []
  const { paidCount, freeCount, topCourses } = computeFinanceStats(courses)

  const revenue = useRevenueAnalytics('month')
  const payouts = useTeacherPayouts()

  return (
    <div>
      <Breadcrumb items={[{ label: 'Administration', to: '/admin' }, { label: 'Finance' }]} />
      <div className="container py-8">
        <h1 className="font-serif text-h1 text-ink">Aperçu financier</h1>
        <p className="mt-1 font-sans text-body italic text-ink-muted">
          Revenus réellement encaissés (paiements confirmés).
        </p>

        {revenue.isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : revenue.isError ? (
          <div className="mt-8 border border-line bg-surface p-8 text-center">
            <p className="font-sans text-body text-danger">
              Impossible de charger les statistiques de paiement.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="border border-line bg-surface p-5">
                <p className="font-sans text-eyebrow text-ink-muted">Revenu total encaissé (12 mois)</p>
                <p className="mt-1 font-serif text-h2 text-ink">{formatPrice(revenue.data?.totalRevenue ?? 0)}</p>
              </div>
              <div className="border border-line bg-surface p-5">
                <p className="font-sans text-eyebrow text-ink-muted">Transactions réussies</p>
                <p className="mt-1 font-serif text-h2 text-ink">{revenue.data?.totalTransactions ?? 0}</p>
              </div>
              <div className="border border-line bg-surface p-5">
                <p className="font-sans text-eyebrow text-ink-muted">Cours au catalogue</p>
                <p className="mt-1 font-serif text-h2 text-ink">{paidCount + freeCount}</p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-serif text-h2 text-ink">Revenu par mois</h2>
              {(revenue.data?.points.length ?? 0) === 0 ? (
                <div className="mt-4 border border-line bg-surface p-12 text-center">
                  <p className="font-serif text-h3 text-ink">Aucun paiement confirmé pour l'instant.</p>
                </div>
              ) : (
                <ul className="mt-4 space-y-2">
                  {revenue.data!.points.map((point) => (
                    <li key={point.period} className="flex items-center justify-between border border-line bg-surface p-4">
                      <p className="font-sans text-body text-ink">{point.period}</p>
                      <p className="font-sans text-eyebrow text-ink-muted">{point.transactionCount} transaction(s)</p>
                      <p className="font-serif text-h3 text-ink">{formatPrice(point.amount)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        <div className="mt-10">
          <h2 className="font-serif text-h2 text-ink">Reversements enseignants</h2>
          <p className="mt-1 font-sans text-eyebrow text-ink-muted">
            {payouts.data ? `Part enseignant : ${Math.round(payouts.data.teacherShareRate * 100)} %` : ''}
          </p>
          {payouts.isLoading ? (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : payouts.isError ? (
            <div className="mt-4 border border-line bg-surface p-8 text-center">
              <p className="font-sans text-body text-danger">Impossible de charger les reversements.</p>
            </div>
          ) : (payouts.data?.payouts.length ?? 0) === 0 ? (
            <div className="mt-4 border border-line bg-surface p-12 text-center">
              <p className="font-serif text-h3 text-ink">Aucun revenu enseignant pour l'instant.</p>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {payouts.data!.payouts.map((payout) => (
                <li key={payout.teacherEmail} className="flex items-center justify-between border border-line bg-surface p-4">
                  <div>
                    <p className="font-serif text-h3 text-ink">{payout.teacherEmail}</p>
                    <p className="font-sans text-eyebrow text-ink-muted">
                      {payout.transactionCount} vente(s) · revenu total {formatPrice(payout.totalRevenue)}
                    </p>
                  </div>
                  <p className="font-serif text-h3 text-ink">{formatPrice(payout.teacherShare)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10">
          <h2 className="font-serif text-h2 text-ink">Meilleurs revenus potentiels (estimation catalogue)</h2>
          <p className="mt-1 font-sans text-eyebrow text-ink-muted italic">
            Prix × nombre d'inscrits — indicatif, distinct des revenus réellement encaissés ci-dessus.
          </p>
          {isLoading ? (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="mt-4 border border-line bg-surface p-8 text-center">
              <p className="font-sans text-body text-danger">Impossible de charger les données du catalogue.</p>
            </div>
          ) : topCourses.length === 0 ? (
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
      </div>
    </div>
  )
}
