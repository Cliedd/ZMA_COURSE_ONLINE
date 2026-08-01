import { useTranslation } from 'react-i18next'
import { COURSE_LEVELS } from '@/entities/course'
import { DEPARTMENTS } from '@/shared/config/navigation'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import type { CourseFilters } from '@/entities/course'

const DEPT_DOT = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5'] as const

interface FilterBarProps {
  filters: CourseFilters
  onSetFilter: (key: 'department' | 'level' | 'q', value: string | undefined) => void
}

/** Barre de filtres du catalogue : deux sections dépliables (niveau, département),
 *  registre « sidebar éditoriale » avec puces actives/inactives. Les départements
 *  portent un repère de couleur (`--dept-1..5`), cohérent avec DepartmentsSection.
 *  La recherche vit dans la bannière de CataloguePage (pas ici) — évite un
 *  doublon d'input synchronisé sur le même filtre `q`. */
export function FilterBar({ filters, onSetFilter }: FilterBarProps) {
  const { t } = useTranslation()

  return (
    <div className="border border-line bg-surface">
      <p className="border-b border-line px-5 py-3 font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-ink-faint">
        {t('catalogue.filters')}
      </p>
      <Accordion type="multiple" defaultValue={['level', 'department']} className="grid gap-0 sm:grid-cols-2">
        <AccordionItem value="level" className="border-b-0 px-5 sm:border-b-0 sm:border-r sm:border-line">
          <AccordionTrigger className="py-3">{t('catalogue.filtersLevel')}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              <Chip active={!filters.level} onClick={() => onSetFilter('level', undefined)}>{t('catalogue.all')}</Chip>
              {COURSE_LEVELS.map((level) => (
                <Chip key={level} active={filters.level === level} onClick={() => onSetFilter('level', level)}>
                  {t(`level.${level}`, level)}
                </Chip>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="department" className="border-b-0 px-5">
          <AccordionTrigger className="py-3">{t('catalogue.filtersDept')}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1">
              <Chip full active={!filters.department} onClick={() => onSetFilter('department', undefined)}>
                {t('catalogue.all')}
              </Chip>
              {DEPARTMENTS.map((dept, i) => (
                <Chip
                  key={dept.value}
                  full
                  active={filters.department === dept.value}
                  onClick={() => onSetFilter('department', dept.value)}
                >
                  <span className={cn('inline-block h-2 w-2 shrink-0 rounded-full', DEPT_DOT[i % DEPT_DOT.length])} aria-hidden />
                  {t(dept.labelKey)}
                </Chip>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

function Chip({
  active,
  onClick,
  full = false,
  children,
}: {
  active: boolean
  onClick: () => void
  full?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex min-h-touch items-center gap-2 border font-sans text-sm transition-colors duration-brand ease-brand',
        full ? 'w-full justify-start px-3' : 'px-3',
        active ? 'border-ink bg-ink text-paper' : 'border-line bg-surface text-ink-muted hover:border-ink/40 hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
