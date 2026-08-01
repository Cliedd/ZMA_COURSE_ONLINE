import { useTranslation } from 'react-i18next'
import { DEPARTMENTS } from '@/shared/config/navigation'

const DEPT_HOVER_BG = ['hover:bg-dept-1', 'hover:bg-dept-2', 'hover:bg-dept-3', 'hover:bg-dept-4', 'hover:bg-dept-5'] as const

/**
 * Liste à plat des disciplines enseignées, dérivée des indices de département
 * réels (`nav.departmentHints.*`) plutôt que d'une liste fictive dupliquée.
 */
export function DisciplinesListSection() {
  const { t } = useTranslation()

  const chips = DEPARTMENTS.flatMap((dept, i) =>
    t(dept.hintKey)
      .split('·')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label) => ({ label, hoverBg: DEPT_HOVER_BG[i % DEPT_HOVER_BG.length] })),
  )

  return (
    <section className="container py-14 sm:py-20">
      <div className="max-w-2xl">
        <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">
          {t('home.disciplines.eyebrow')}
        </p>
        <h2 className="mt-3 font-serif text-h1 text-ink">{t('home.disciplines.title')}</h2>
        <p className="mt-4 font-sans text-body leading-relaxed text-ink-muted">{t('home.disciplines.intro')}</p>
      </div>

      <ul className="mt-10 flex flex-wrap gap-2.5">
        {chips.map(({ label, hoverBg }, i) => (
          <li key={`${label}-${i}`}>
            <span
              className={`inline-flex cursor-default items-center rounded-full border border-line px-5 py-2.5 font-sans text-sm font-semibold text-ink transition-colors duration-brand ease-brand hover:border-transparent hover:text-scene-ink ${hoverBg}`}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
