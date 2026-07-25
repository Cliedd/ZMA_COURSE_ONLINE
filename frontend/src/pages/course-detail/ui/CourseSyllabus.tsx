import { ChevronDown } from 'lucide-react'
import type { CurriculumSection } from '@/entities/course'

/** Programme du cours en sections dépliables (details/summary natifs, accessibles). */
export function CourseSyllabus({ sections }: { sections: CurriculumSection[] }) {
  return (
    <div className="divide-y divide-line border border-line">
      {sections.map((section, index) => (
        <details key={section.id} open={index === 0} className="group">
          <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between gap-3 bg-surface px-4 py-3 font-serif text-h3 text-ink">
            <span>{section.title}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-brand ease-brand group-open:rotate-180" aria-hidden />
          </summary>
          <ul className="bg-paper px-4 pb-4">
            {section.lessons.map((lesson, i) => (
              <li key={i} className="border-t border-line py-2.5 font-sans text-sm text-ink-muted first:border-t-0">
                {lesson}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}
