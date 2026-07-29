import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'
import { Skeleton, Button, Input } from '@/shared/ui'
import { courseApi, courseKeys } from '@/entities/course'
import { useCheckout } from '@/entities/payment'
import type { PaymentProvider } from '@/entities/payment'
import { formatPrice } from '@/shared/config/i18n'
import { AppError } from '@/shared/api/http'
import { PaymentMethodSelector } from './PaymentMethodSelector'

export function CheckoutPage() {
  const { t } = useTranslation()
  const { courseId } = useParams()
  const [promo, setPromo] = useState('')
  const [provider, setProvider] = useState<PaymentProvider | null>(null)
  const [freeCourseDone, setFreeCourseDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Le prix vient du catalogue ; on récupère le cours par id via la liste puis filtrage.
  const { data: course, isLoading } = useQuery({
    queryKey: [...courseKeys.all, 'byId', courseId],
    queryFn: async () => (await courseApi.list({ size: 100 })).content.find((c) => c.id === courseId) ?? null,
    enabled: Boolean(courseId),
  })

  const checkout = useCheckout()

  const isFree = course != null && course.price <= 0

  const pay = async () => {
    if (!courseId) return
    if (!isFree && !provider) return
    setError(null)
    try {
      const payment = await checkout.mutateAsync({ courseId, provider: provider ?? undefined, promoCode: promo || undefined })
      if (isFree) {
        // Cours gratuit : le serveur confirme immédiatement, pas de gateway.
        setFreeCourseDone(true)
        return
      }
      if (!payment.checkoutUrl) {
        setError(t('checkout.notFound'))
        return
      }
      // Redirection vers la page hébergée du gateway (Stripe/CinetPay) — les
      // coordonnées de paiement sont saisies là-bas, jamais sur nos serveurs.
      window.location.href = payment.checkoutUrl
    } catch (e) {
      setError(e instanceof AppError ? e.message : 'Erreur')
    }
  }

  if (isLoading) return <div className="container py-16"><Skeleton className="h-64 w-full max-w-lg" /></div>
  if (!course) return <div className="container py-16"><p className="font-serif text-h2 text-ink">{t('checkout.notFound')}</p></div>

  if (freeCourseDone) {
    return (
      <div className="container flex flex-col items-start gap-4 py-16">
        <h1 className="font-serif text-h1 text-ink">{t('checkout.success')}</h1>
        <Link to={`/learning/${course.id}`} className="inline-flex min-h-touch items-center rounded bg-ink px-6 font-sans text-sm font-semibold text-paper">{t('checkout.goCourse')}</Link>
      </div>
    )
  }

  const busy = checkout.isPending
  const canPay = isFree || provider != null

  return (
    <div className="container max-w-lg py-12">
      <h1 className="font-serif text-h1 text-ink">{t('checkout.title')}</h1>
      <div className="mt-8 border border-line bg-surface p-6">
        <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.16em] text-accent-ink">{t('checkout.course')}</p>
        <p className="mt-1 font-serif text-h3 text-ink">{course.title}</p>
        <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
          <span className="font-sans text-sm text-ink-muted">{t('checkout.price')}</span>
          <span className="font-serif text-h2 text-ink">{formatPrice(course.price)}</span>
        </div>

        {!isFree && (
          <div className="mt-6">
            <p className="mb-3 font-sans text-sm font-semibold text-ink">{t('checkout.choosePaymentMethod')}</p>
            <PaymentMethodSelector value={provider} onChange={setProvider} />
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <Input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder={t('checkout.promo')} aria-label={t('checkout.promo')} />
        </div>
        {error && <p role="alert" className="mt-3 font-sans text-sm text-danger">{error}</p>}
        <Button onClick={pay} size="lg" disabled={busy || !canPay} className="mt-5 w-full">
          {busy ? t('checkout.paying') : t('checkout.pay')}
        </Button>
        {!isFree && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center font-sans text-xs text-ink-faint">
            <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
            {t('checkout.securePayment')}
          </p>
        )}
        <p className="mt-3 text-center font-sans text-sm text-ink-faint">{t('checkout.lifetime')}</p>
      </div>
    </div>
  )
}
