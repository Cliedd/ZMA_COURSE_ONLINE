import { Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui'
import type { CurriculumSection } from '@/entities/course'
import { lessonTitle } from '@/entities/course'

/** Programme du cours en sections dépliables, registre « académique » : indice
 *  numéroté par section, compte de leçons, chevron `+` (primitive Accordion partagée). */
export function CourseSyllabus({ sections }: { sections: CurriculumSection[] }) {
  const { t } = useTranslation()

  return (
    <Accordion type="multiple" defaultValue={sections[0] ? [sections[0].id] : []} className="border border-line bg-surface">
      {sections.map((section, index) => (
        <AccordionItem key={section.id} value={section.id} className="px-4 last:border-b-0">
          <AccordionTrigger>
            <span className="flex flex-1 items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-accent-ink/30 font-sans text-xs font-bold text-accent-ink">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="font-serif text-h3 text-ink">{section.title}</span>
            </span>
            <span className="shrink-0 font-sans text-xs text-ink-faint">{t('course.lessons', { count: section.lessons.length })}</span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2.5 pl-9">
              {section.lessons.map((lesson, i) => (
                <li key={i} className="flex items-start gap-2.5 font-sans text-sm text-ink-muted">
                  <Play className="mt-0.5 h-3 w-3 shrink-0 fill-accent-ink text-accent-ink" aria-hidden />
                  {lessonTitle(lesson)}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
