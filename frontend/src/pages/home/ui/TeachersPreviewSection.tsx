import { useTranslation } from 'react-i18next'
import { useTeachers } from '@/entities/teacher'
import { departmentLabel } from '@/shared/config/navigation'
import { Skeleton } from '@/shared/ui'

const DEPT_BG = ['bg-dept-1', 'bg-dept-2', 'bg-dept-3', 'bg-dept-4', 'bg-dept-5'] as const

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')
}

/** Aperçu de l'équipe enseignante — 4 premiers profils réels, dérivés des cours. */
export function TeachersPreviewSection() {
  const { t } = useTranslation()
  const { data, isLoading } = useTeachers()
  const teachers = (data ?? []).slice(0, 4)

  if (!isLoading && teachers.length === 0) return null

  return (
    <section className="border-t border-line bg-surface py-14 sm:py-20 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">
              {t('home.teachersPreview.eyebrow')}
            </p>
            <h2 className="mt-3 font-serif text-h1 text-ink">{t('home.teachersPreview.title')}</h2>
          </div>
          <p className="font-sans text-body leading-relaxed text-ink-muted">{t('home.teachersPreview.body')}</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-square" />)
            : teachers.map((teacher, i) => (
                <article key={teacher.username} className="border border-line bg-paper transition-transform duration-brand ease-brand hover:-translate-y-1">
                  <div className={`grid aspect-square place-items-center ${DEPT_BG[i % DEPT_BG.length]}`}>
                    <span className="font-serif text-h1 text-scene-ink">{initials(teacher.name)}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-h3 text-ink">{teacher.name}</h3>
                    <p className="mt-1 font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-ink-faint">
                      {teacher.departments.map((d) => departmentLabel(t, d)).join(' · ') || '—'}
                    </p>
                  </div>
                </article>
              ))}
        </div>
      </div>
    </section>
  )
}
