import { useTranslation } from 'react-i18next'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui'

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'] as const

/** FAQ accordion, registre clair. Contenu réel dans `home.faq.*` (i18n) — un seul item ouvert à la fois. */
export function FAQSection() {
  const { t } = useTranslation()

  return (
    <section className="bg-paper py-14 sm:py-20 md:py-24" id="faq">
      <div className="container grid grid-cols-1 gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="max-w-md">
          <p className="font-sans text-eyebrow font-bold uppercase tracking-[0.22em] text-accent-ink">
            {t('home.faq.eyebrow')}
          </p>
          <h2 className="mt-3 font-serif text-h1 text-ink">{t('home.faq.title')}</h2>
          <p className="mt-4 font-sans text-body leading-relaxed text-ink-muted">{t('home.faq.intro')}</p>
        </div>

        <Accordion type="single" collapsible defaultValue="q1" className="border-t-2 border-ink">
          {QUESTION_KEYS.map((key) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger>{t(`home.faq.items.${key}`)}</AccordionTrigger>
              <AccordionContent>{t(`home.faq.items.a${key.slice(1)}`)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
