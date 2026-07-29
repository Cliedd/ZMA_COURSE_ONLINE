import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr.json'
import en from './en.json'

export const SUPPORTED_LOCALES = ['fr', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_STORAGE_KEY = 'zma-locale'

function isSupportedLocale(value: string | null): value is Locale {
  return value !== null && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

function readStoredLocale(): Locale {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null
  return isSupportedLocale(raw) ? raw : 'fr'
}

/** Français et anglais (chantier 5). La langue initiale est relue depuis localStorage,
 * avec repli sur le français si rien n'est stocké. */
void i18next.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: readStoredLocale(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
  returnNull: false,
})

export const i18n = i18next

/** Change la langue active et persiste le choix pour les prochaines sessions. */
export function setLocale(next: Locale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, next)
  void i18next.changeLanguage(next)
}

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
