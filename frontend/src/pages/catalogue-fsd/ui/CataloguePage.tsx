import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { CourseGrid } from '@/widgets/course-grid'
import { useCourses } from '@/entities/course'
import { useCatalogFilters, FilterBar } from '@/features/catalog-filters'

/** Boutique de cours : sélection et achat des formations. Filtres portés par l'URL. */
export function CataloguePage() {
  const { t } = useTranslation()
  const { filters, setFilter, setPage, reset, hasActiveFilters } = useCatalogFilters()
  const { data, isLoading, isError, refetch } = useCourses(filters)

  const courses = data?.content ?? []
  const total = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0
  const currentPage = (filters.page ?? 0) + 1

  return (
    <div>
      <Breadcrumb items={[{ label: t('catalogue.shop') }]} />

      <div className="container py-10">
        <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-gold-ink">{t('catalogue.shop')}</p>
        <h1 className="mt-3 font-serif text-h1 text-ink">{t('catalogue.title')}</h1>
        <p className="mt-3 max-w-2xl font-sans text-body leading-relaxed text-ink-muted">{t('catalogue.subtitle')}</p>

        <div className="mt-8">
          <FilterBar filters={filters} onSetFilter={setFilter} />
        </div>

        {!isLoading && !isError && (
          <p className="mt-6 font-sans text-sm text-ink-muted">{t('catalogue.results', { count: total })}</p>
        )}

        <div className="mt-6">
          {isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : (
            <CourseGrid
              courses={courses}
              loading={isLoading}
              emptyState={<EmptyState onReset={reset} showReset={hasActiveFilters} />}
            />
          )}
        </div>

        {totalPages > 1 && (
          <Pagination page={currentPage} totalPages={totalPages} onPage={setPage} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ onReset, showReset }: { onReset: () => void; showReset: boolean }) {
  const { t } = useTranslation()
  return (
    <div className="border border-line bg-surface p-12 text-center">
      <p className="font-serif text-h3 text-ink">{t('catalogue.empty')}</p>
      {showReset && (
        <button onClick={onReset} className="mt-4 inline-flex min-h-touch items-center rounded border border-ink px-5 font-sans text-sm font-semibold text-ink">
          {t('catalogue.emptyAction')}
        </button>
      )}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="border border-line bg-surface p-12 text-center">
      <p className="font-serif text-h3 text-ink">{t('error.title')}</p>
      <button onClick={onRetry} className="mt-4 inline-flex min-h-touch items-center rounded bg-ink px-5 font-sans text-sm font-semibold text-paper">
        {t('error.retry')}
      </button>
    </div>
  )
}

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {Array.from({ length: totalPages }).map((_, i) => {
        const p = i + 1
        return (
          <button
            key={p}
            onClick={() => onPage(p)}
            aria-current={p === page ? 'page' : undefined}
            className={p === page
              ? 'min-h-touch min-w-touch rounded bg-ink px-3 font-sans text-sm font-semibold text-paper'
              : 'min-h-touch min-w-touch rounded border border-line px-3 font-sans text-sm text-ink-muted hover:text-ink'}
          >
            {p}
          </button>
        )
      })}
    </nav>
  )
}
