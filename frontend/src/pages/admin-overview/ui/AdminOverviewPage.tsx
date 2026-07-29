import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useAdminCourses } from '@/entities/course'
import { useAdminUsers } from '@/entities/admin-user'

/** Vue d'ensemble administrateur : KPIs de haut niveau et raccourcis vers les autres pages admin. */
export function AdminOverviewPage() {
  const { t } = useTranslation()
  const { data: coursePage, isLoading: coursesLoading } = useAdminCourses()
  const { data: userPage, isLoading: usersLoading } = useAdminUsers()

  const publishedOnPage = coursePage?.content.filter((c) => c.published).length ?? 0

  return (
    <div>
      <Breadcrumb items={[{ label: t('adminOverview.breadcrumb') }]} />
      <div className="container py-8">
        <h1 className="font-serif text-h1 text-ink">{t('adminOverview.title')}</h1>
        <p className="mt-1 font-sans text-body text-ink-muted">
          {t('adminOverview.subtitle')}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="border border-line bg-surface p-5">
            <p className="font-sans text-eyebrow text-ink-muted">{t('adminOverview.totalCourses')}</p>
            <p className="mt-1 font-serif text-h2 text-ink">
              {coursesLoading ? '—' : coursePage?.totalElements ?? 0}
            </p>
          </div>
          <div className="border border-line bg-surface p-5">
            <p className="font-sans text-eyebrow text-ink-muted">{t('adminOverview.users')}</p>
            <p className="mt-1 font-serif text-h2 text-ink">
              {usersLoading ? '—' : userPage?.totalElements ?? 0}
            </p>
          </div>
          <div className="border border-line bg-surface p-5">
            <p className="font-sans text-eyebrow text-ink-muted">{t('adminOverview.publishedCourses')}</p>
            <p className="mt-1 font-serif text-h2 text-ink">
              {coursesLoading ? '—' : publishedOnPage}
            </p>
            <p className="mt-1 font-sans text-sm text-ink-muted">{t('adminOverview.onThisPage')}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/admin/users"
            className="flex min-h-touch items-center justify-between border border-line bg-surface p-5 font-sans text-body text-ink hover:border-ink"
          >
            <span>{t('adminOverview.userManagement')}</span>
            <span aria-hidden="true" className="text-accent-ink">→</span>
          </Link>
          <Link
            to="/admin/finance"
            className="flex min-h-touch items-center justify-between border border-line bg-surface p-5 font-sans text-body text-ink hover:border-ink"
          >
            <span>{t('adminOverview.financeOverview')}</span>
            <span aria-hidden="true" className="text-accent-ink">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
