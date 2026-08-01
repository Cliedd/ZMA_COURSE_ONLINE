import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BlurFade } from '@/shared/ui'
import { DEPARTMENTS } from '@/shared/config/navigation'

const DEPT_DOT = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5'] as const

/** Liste numérotée des cinq départements, registre clair. Chaque ligne porte un
 * repère de couleur (`--dept-1..5`) et révèle une flèche au survol. */
export function DepartmentsSection() {
  const { t } = useTranslation()

  return (
    <section className="container py-20">
      <BlurFade className="max-w-2xl">
        <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">
          {t('home.departmentsEyebrow')}
        </p>
        <div className="mt-3 h-px w-11 bg-accent" />
        <h2 className="mt-5 font-serif text-h1 text-ink">{t('home.departmentsTitle')}</h2>
        <p className="mt-4 font-sans text-body leading-relaxed text-ink-muted">{t('home.departmentsBody')}</p>
      </BlurFade>

      <div className="mt-10 border-t-2 border-ink">
        {DEPARTMENTS.map((dept, i) => (
          <Link
            key={dept.value}
            to={dept.to}
            className="group relative flex min-h-touch items-center gap-4 border-b border-line py-6 pl-2 transition-[padding] duration-brand ease-brand hover:pl-6 sm:gap-6"
          >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${DEPT_DOT[i % DEPT_DOT.length]}`} aria-hidden />
            <span className="font-mono text-xs font-bold text-ink-faint">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="flex-1">
              <span className="block font-serif text-h3 text-ink">{t(dept.labelKey)}</span>
              <span className="mt-0.5 block font-sans text-sm text-ink-muted">{t(dept.hintKey)}</span>
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 text-ink-faint opacity-0 transition-all duration-brand ease-brand group-hover:translate-x-1 group-hover:opacity-100"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
