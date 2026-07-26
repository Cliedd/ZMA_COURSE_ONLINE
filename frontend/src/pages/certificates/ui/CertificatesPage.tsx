import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Award } from 'lucide-react'
import { Skeleton } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useMyCertificates } from '@/entities/enrollment'

export function CertificatesPage() {
  const { t } = useTranslation()
  const { data: certs = [], isLoading } = useMyCertificates()

  return (
    <div>
      <Breadcrumb items={[{ label: t('certificates.title') }]} />
      <div className="container py-8">
        <h1 className="font-serif text-h1 text-ink">{t('certificates.title')}</h1>
        {isLoading ? (
          <Skeleton className="mt-8 h-28 w-full" />
        ) : certs.length === 0 ? (
          <div className="mt-8 border border-line bg-surface p-12 text-center font-sans text-body text-ink-muted">{t('certificates.empty')}</div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {certs.map((c) => (
              <li key={c.id} className="flex items-center gap-4 border border-line bg-surface p-5">
                <Award className="h-8 w-8 shrink-0 text-accent-ink" aria-hidden />
                <div className="min-w-0">
                  <p className="font-mono text-sm text-ink-muted">{t('certificates.number')} {c.certNumber}</p>
                  <Link to={`/certificates/verify/${c.certNumber}`} className="font-sans text-sm font-semibold text-blue hover:underline">{t('certificates.verify')}</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
