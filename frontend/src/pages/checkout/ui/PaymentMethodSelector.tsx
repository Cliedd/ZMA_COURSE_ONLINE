import { useTranslation } from 'react-i18next'
import { SiVisa, SiMastercard, SiPaypal } from 'react-icons/si'
import { Smartphone } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { PaymentProvider } from '@/entities/payment'

interface Method {
  provider: PaymentProvider
  label: string
  hint?: string
  icons: React.ReactNode
}

/**
 * Un seul bouton par gateway réelle — pas un bouton par réseau de carte : le
 * réseau (Visa vs Mastercard) n'est choisi qu'une fois sur la page Stripe
 * elle-même, Stripe le détecte depuis le numéro saisi. Les icônes ici
 * indiquent seulement "ce qu'on accepte", pas des chemins de paiement
 * distincts.
 */
export function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentProvider | null
  onChange: (provider: PaymentProvider) => void
}) {
  const { t } = useTranslation()

  const methods: Method[] = [
    {
      provider: 'STRIPE_CARD',
      label: t('checkout.methodCard'),
      hint: t('checkout.methodCardHint'),
      icons: (
        <>
          <SiVisa aria-hidden className="h-6 w-auto text-ink" />
          <SiMastercard aria-hidden className="h-6 w-auto text-ink" />
        </>
      ),
    },
    {
      provider: 'STRIPE_PAYPAL',
      label: t('checkout.methodPaypal'),
      icons: <SiPaypal aria-hidden className="h-6 w-auto text-ink" />,
    },
    {
      provider: 'CINETPAY',
      label: t('checkout.methodCinetpay'),
      hint: t('checkout.methodCinetpayHint'),
      icons: <Smartphone aria-hidden className="h-6 w-6 text-ink" />,
    },
  ]

  return (
    <div role="radiogroup" aria-label={t('checkout.choosePaymentMethod')} className="grid gap-3 sm:grid-cols-3">
      {methods.map((method) => {
        const selected = value === method.provider
        return (
          <button
            key={method.provider}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(method.provider)}
            className={cn(
              'flex min-h-touch flex-col items-center gap-2 border p-4 text-center transition-colors',
              selected ? 'border-ink bg-surface' : 'border-line bg-paper hover:border-ink-muted',
            )}
          >
            <span className="flex h-6 items-center gap-2">{method.icons}</span>
            <span className="font-sans text-sm font-semibold text-ink">{method.label}</span>
            {method.hint && <span className="font-sans text-xs text-ink-muted">{method.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}
