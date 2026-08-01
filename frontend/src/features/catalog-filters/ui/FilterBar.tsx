import { useTranslation } from 'react-i18next'
import { COURSE_LEVELS } from '@/entities/course'
import { DEPARTMENTS } from '@/shared/config/navigation'
import { cn } from '@/shared/lib/cn'
import type { CourseFilters } from '@/entities/course'

interface FilterBarProps {
  filters: CourseFilters
  onSetFilter: (key: 'department' | 'level' | 'q', value: string | undefined) => void
}

/** Barre de filtres du catalogue : puces niveau + puces département.
 *  La recherche vit dans la bannière de CataloguePage (pas ici) — évite un
 *  doublon d'input synchronisé sur le même filtre `q`. */
export function FilterBar({ filters, onSetFilter }: FilterBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-5">
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
          <Chip key={dept.value} active={filters.department === dept.value} onClick={() => onSetFilter('department', dept.value)}>
            {t(dept.labelKey)}
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
