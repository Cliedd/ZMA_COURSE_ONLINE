import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr.json'

export const SUPPORTED_LOCALES = ['fr', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

/** Français seul pour l'instant. L'anglais est ajouté au chantier 5. */
void i18next.use(initReactI18next).init({
  resources: { fr: { translation: fr } },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export const i18n = i18next

const locale = (): string => i18next.language || 'fr'

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(locale(), {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export function formatDuration(hours: number): string {
  // Formatage manuel volontaire ici (contrairement à formatPrice/formatDate qui passent
  // par Intl). Intl.NumberFormat({style:'unit'}) insère une espace fine insécable U+202F
  // invisible entre le nombre et l'unité — source de bugs de comparaison de chaînes et de
  // recherche, pour aucun gain sur un simple « 42 h ». On garde une espace ordinaire, stable.
  if (hours < 1) return `${Math.round(hours * 60)} min`
  return `${Math.round(hours)} h`
}
