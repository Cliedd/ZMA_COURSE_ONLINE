import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Button, Skeleton } from '@/shared/ui'
import { usePaymentStatus } from '@/entities/payment'

/**
 * Cible du success_url/cancel_url (Stripe) et return_url (CinetPay). Le
 * paramètre `status` renvoyé par le gateway n'est JAMAIS la source de
 * vérité — un utilisateur pourrait arriver ici avec n'importe quelle valeur
 * dans l'URL. La seule chose qui fait foi est l'état réel du paiement en
 * base, lui-même mis à jour uniquement par un webhook signé
 * (voir PaymentController.stripeWebhook / cinetpayWebhook côté backend).
 * On poll donc GET /payments/{id} jusqu'à ce qu'il quitte PENDING.
 */
export function CheckoutReturnPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const paymentId = params.get('paymentId') ?? undefined
  const gatewayStatus = params.get('status') // "success" | "cancelled" — indicatif seulement

  const { data: payment, isLoading } = usePaymentStatus(paymentId, { pollWhilePending: true })

  if (!paymentId) {
    return (
      <div className="container flex flex-col items-center gap-4 py-16 text-center">
        <XCircle aria-hidden className="h-12 w-12 text-danger" />
        <p className="font-serif text-h2 text-ink">{t('checkout.return.failed')}</p>
        <Link to="/dashboard"><Button>{t('checkout.return.goDashboard')}</Button></Link>
      </div>
    )
  }

  if (isLoading || !payment) {
    return (
      <div className="container flex flex-col items-center gap-4 py-16 text-center">
        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
        <p className="font-sans text-body text-ink-muted">{t('checkout.return.checking')}</p>
      </div>
    )
  }

  if (payment.status === 'SUCCESS') {
    return (
      <div className="container flex flex-col items-center gap-4 py-16 text-center">
        <CheckCircle2 aria-hidden className="h-12 w-12 text-success" />
        <h1 className="font-serif text-h1 text-ink">{t('checkout.return.success')}</h1>
        <Link to={`/learning/${payment.courseId}`}>
          <Button size="lg">{t('checkout.goCourse')}</Button>
        </Link>
      </div>
    )
  }

  if (payment.status === 'PENDING') {
    // gatewayStatus === 'cancelled' est indicatif (l'utilisateur a annulé côté
    // Stripe/CinetPay) mais le paiement peut encore être PENDING côté serveur
    // tant qu'aucun webhook n'a tranché — on l'affiche sans jamais l'assimiler
    // à un échec confirmé.
    return (
      <div className="container flex flex-col items-center gap-4 py-16 text-center">
        <Loader2 aria-hidden className="h-12 w-12 animate-spin text-ink-muted" />
        <p className="font-sans text-body text-ink-muted">
          {gatewayStatus === 'cancelled' ? t('checkout.return.cancelled') : t('checkout.return.pending')}
        </p>
        <Link to={`/checkout/${payment.courseId}`}>
          <Button variant="secondary">{t('checkout.return.backToCourse')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container flex flex-col items-center gap-4 py-16 text-center">
      <XCircle aria-hidden className="h-12 w-12 text-danger" />
      <p className="font-sans text-body text-ink">
        {payment.status === 'REFUNDED' ? t('checkout.return.cancelled') : t('checkout.return.failed')}
      </p>
      <Link to={`/checkout/${payment.courseId}`}>
        <Button variant="secondary">{t('checkout.return.backToCourse')}</Button>
      </Link>
    </div>
  )
}
