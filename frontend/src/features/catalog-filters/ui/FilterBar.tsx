import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { COURSE_LEVELS } from '@/entities/course'
import { DEPARTMENTS } from '@/shared/config/navigation'
import { cn } from '@/shared/lib/cn'
import type { CourseFilters } from '@/entities/course'

interface FilterBarProps {
  filters: CourseFilters
  onSetFilter: (key: 'department' | 'level' | 'q', value: string | undefined) => void
}

/** Barre de filtres du catalogue : recherche + puces niveau + puces département. */
export function FilterBar({ filters, onSetFilter }: FilterBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-5">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
        <input
          type="search"
          value={filters.q ?? ''}
          onChange={(e) => onSetFilter('q', e.target.value || undefined)}
          placeholder={t('catalogue.search')}
          aria-label={t('catalogue.search')}
          className="min-h-touch w-full rounded border border-line bg-surface pl-9 pr-3 font-sans text-body text-ink placeholder:text-ink-faint"
        />
      </div>

      <ChipRow label={t('catalogue.filtersLevel')}>
        <Chip active={!filters.level} onClick={() => onSetFilter('level', undefined)}>{t('catalogue.all')}</Chip>
        {COURSE_LEVELS.map((level) => (
          <Chip key={level} active={filters.level === level} onClick={() => onSetFilter('level', level)}>
            {t(`level.${level}`, level)}
          </Chip>
        ))}
      </ChipRow>

      <ChipRow label={t('catalogue.filtersDept')}>
        <Chip active={!filters.department} onClick={() => onSetFilter('department', undefined)}>{t('catalogue.all')}</Chip>
        {DEPARTMENTS.map((dept) => (
          <Chip key={dept.label} active={filters.department === dept.label} onClick={() => onSetFilter('department', dept.label)}>
            {dept.label}
          </Chip>
        ))}
      </ChipRow>
    </div>
  )
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-ink-faint">{label}</span>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-touch rounded border px-3 font-sans text-sm transition-colors duration-brand ease-brand',
        active ? 'border-ink bg-ink text-paper' : 'border-line bg-surface text-ink-muted hover:border-ink/40 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
