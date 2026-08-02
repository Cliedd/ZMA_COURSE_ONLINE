import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { CourseGrid } from '@/widgets/course-grid'
import { Picture } from '@/shared/ui'
import { IMAGES } from '@/shared/config/images/manifest'
import { useDebouncedValue } from '@/shared/lib/useDebouncedValue'
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

  // État local pour une saisie réactive ; la valeur débouncée seule est répercutée dans l'URL,
  // pour éviter une requête API à chaque frappe (spec § 6 règle 5 : l'URL reste la source de vérité).
  const [searchInput, setSearchInput] = useState(filters.q ?? '')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const isFirstRun = useRef(true)

  useEffect(() => {
    setSearchInput(filters.q ?? '')
  }, [filters.q])

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    setFilter('q', debouncedSearch || undefined)
    // `setFilter` est maintenant stable (useCatalogFilters ne referme plus sur `params`),
    // donc l'inclure ici ne provoque pas de ré-exécutions superflues — plus besoin de
    // suppression de lint pour masquer une dépendance manquante.
  }, [debouncedSearch, setFilter])

  return (
    <div>
      <Breadcrumb items={[{ label: t('catalogue.shop') }]} />

      {/* En-tête sombre (scène) : titre, décompte, recherche */}
      <section data-theme="dark" className="relative isolate overflow-hidden bg-scene text-scene-ink">
        <div className="absolute inset-0 -z-10">
          <Picture image={IMAGES.heroEnsemble} alt="" priority sizes="100vw" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-scene via-scene/70 to-scene/40" />
        </div>
        <div className="container py-14 text-center md:py-20">
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent">{t('catalogue.shop')}</p>
          <h1 className="mt-3 font-serif text-h1 text-scene-ink">{t('catalogue.title')}</h1>
          <p className="mt-4 font-serif text-display leading-none text-scene-ink">
            {isLoading ? '…' : total}
          </p>
          <p className="mt-2 font-sans text-sm text-scene-ink/70">
            {!isLoading && !isError && t('catalogue.results', { count: total })}
          </p>
          <p className="mx-auto mt-3 max-w-2xl font-sans text-body leading-relaxed text-scene-ink/70">{t('catalogue.subtitle')}</p>

          <div className="relative mx-auto mt-8 max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-scene-ink/50" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('catalogue.search')}
              aria-label={t('catalogue.search')}
              className="min-h-touch w-full rounded border border-scene-ink/20 bg-scene-surface pl-9 pr-3 font-sans text-body text-scene-ink placeholder:text-scene-ink/50 focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </section>

      <div className="container py-10">
        <div className="mt-2">
          <FilterBar filters={filters} onSetFilter={setFilter} />
        </div>

        <div className="mt-8">
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
