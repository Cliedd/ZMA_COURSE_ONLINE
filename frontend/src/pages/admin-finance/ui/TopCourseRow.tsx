import { formatPrice } from '@/shared/config/i18n'
import type { CourseRevenue } from './financeStats'

/** Une ligne du classement des cours par revenu potentiel. Non exportée du module. */
export function TopCourseRow({ item }: { item: CourseRevenue }) {
  return (
    <li className="flex items-center justify-between border border-line bg-surface p-4">
      <div>
        <p className="font-serif text-h3 text-ink">{item.course.title}</p>
        <p className="font-sans text-eyebrow text-ink-muted">
          {formatPrice(item.course.price)} · {item.course.studentsCount} inscrit(s)
        </p>
      </div>
      <p className="font-serif text-h3 text-ink">{formatPrice(item.revenue)}</p>
    </li>
  )
}
