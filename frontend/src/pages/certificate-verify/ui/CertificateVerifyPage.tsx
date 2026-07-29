import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BadgeCheck, ShieldAlert } from 'lucide-react'
import { Skeleton, Button, Field, Input } from '@/shared/ui'
import { Breadcrumb } from '@/widgets/breadcrumb'
import { useVerifyCertificate } from '@/entities/enrollment'
import { AppError } from '@/shared/api/http'
import { i18n } from '@/shared/config/i18n'

/** Formate une date ISO selon la langue active, sans dépendance externe. */
function formatIssuedAt(isoDate: string | null): string {
  if (!isoDate) return ''
  const parsed = new Date(isoDate)
  if (Number.isNaN(parsed.getTime())) return isoDate
  const locale = i18n.language === 'en' ? 'en-US' : 'fr-FR'
  return parsed.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Page publique — aucune authentification requise. Permet à quiconque
 * (par ex. un employeur) de vérifier l'authenticité d'un certificat ZTF
 * à partir de son numéro, via l'URL ou un formulaire de recherche.
 */
export function CertificateVerifyPage() {
  const { t } = useTranslation()
  const { certNumber } = useParams<{ certNumber: string }>()
  const navigate = useNavigate()
  const [input, setInput] = useState('')

  const { data, isLoading, isError, error } = useVerifyCertificate(certNumber)
  const notFound = isError && error instanceof AppError && error.status === 404

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed) navigate(`/certificates/verify/${encodeURIComponent(trimmed)}`)
  }

  return (
    <div>
      <Breadcrumb items={[{ label: t('certificateVerify.breadcrumb') }]} />
      <div className="container max-w-xl py-8">
        <h1 className="font-serif text-h1 text-ink">{t('certificateVerify.title')}</h1>
        <p className="mt-1 font-sans text-body text-ink-muted">
          {t('certificateVerify.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex items-end gap-3">
          <Field name="certNumber" label={t('certificateVerify.numberLabel')} className="flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('certificateVerify.numberPlaceholder')}
            />
          </Field>
          <Button type="submit" size="md">{t('certificateVerify.submit')}</Button>
        </form>

        <div className="mt-8">
          {!certNumber ? null : isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : notFound ? (
            <div role="status" className="flex items-start gap-4 border border-danger bg-surface p-6">
              <ShieldAlert className="h-8 w-8 shrink-0 text-danger" aria-hidden />
              <div>
                <p className="font-serif text-h3 text-ink">{t('certificateVerify.notFoundTitle')}</p>
                <p className="mt-1 font-sans text-body text-ink-muted">
                  {t('certificateVerify.notFoundBody', { certNumber })}
                </p>
              </div>
            </div>
          ) : isError ? (
            <div role="status" className="border border-line bg-surface p-6 text-center">
              <p className="font-sans text-body text-danger">
                {t('certificateVerify.errorBody')}
              </p>
            </div>
          ) : data ? (
            <div role="status" className="flex items-start gap-4 border border-accent-ink bg-surface p-6">
              <BadgeCheck className="h-8 w-8 shrink-0 text-accent-ink" aria-hidden />
              <div>
                <p className="font-serif text-h3 text-ink">{t('certificateVerify.validTitle')}</p>
                <dl className="mt-2 space-y-1 font-sans text-body text-ink-muted">
                  <div>
                    <dt className="inline font-semibold text-ink">{t('certificateVerify.labelNumber')}</dt>
                    <dd className="inline font-mono">{data.certNumber}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-ink">{t('certificateVerify.labelCourse')}</dt>
                    <dd className="inline">{data.courseTitle}</dd>
                  </div>
                  {data.issuedAt && (
                    <div>
                      <dt className="inline font-semibold text-ink">{t('certificateVerify.labelIssuedAt')}</dt>
                      <dd className="inline">{formatIssuedAt(data.issuedAt)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
