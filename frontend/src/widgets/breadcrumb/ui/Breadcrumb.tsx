import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export interface BreadcrumbItem {
  label: string
  to?: string
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const { t } = useTranslation()
  const all: BreadcrumbItem[] = [{ label: t('breadcrumb.home'), to: '/' }, ...items]

  return (
    <nav aria-label={t('breadcrumb.label')} className="border-b border-line">
      <ol className="container flex flex-wrap items-center gap-1 py-2.5 font-sans text-sm text-ink-muted">
        {all.map((item, index) => {
          const isLast = index === all.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden="true" className="px-1 text-gold-ink">›</span>}
              {isLast || !item.to ? (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? 'font-medium text-ink' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="hover:text-ink">{item.label}</Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
