import { describe, it, expect, beforeAll } from 'vitest'
import { i18n, formatDate, formatDuration, formatPrice } from './index'

beforeAll(async () => {
  if (!i18n.isInitialized) await i18n.init()
})

describe('i18n', () => {
  it('démarre en anglais (langue par défaut)', () => {
    expect(i18n.language).toBe('en')
  })

  it('traduit une clé existante', () => {
    expect(i18n.t('nav.catalogue')).toBe('Courses')
  })

  it('renvoie la clé pour une traduction manquante, sans planter', () => {
    expect(i18n.t('cle.qui.nexiste.pas')).toBe('cle.qui.nexiste.pas')
  })

  it('expose les libellés de la navigation mobile', () => {
    expect(i18n.t('nav.mobile.explore')).toBe('Explore')
    expect(i18n.t('nav.mobile.myCourses')).toBe('My courses')
  })

  it('expose les textes de la page 404', () => {
    expect(i18n.t('notFound.title')).toContain("can't be found")
  })

  it('bascule vers le français et traduit correctement', async () => {
    await i18n.changeLanguage('fr')
    expect(i18n.t('nav.catalogue')).toBe('Formations')
    await i18n.changeLanguage('en')
  })
})

describe('formatage', () => {
  it('formate un prix en dollars, à l\'anglaise', () => {
    expect(formatPrice(18)).toMatch(/\$18/)
  })

  it('formate une date en anglais', () => {
    expect(formatDate('2026-03-14T10:00:00Z')).toContain('March')
  })

  it('formate une durée en heures', () => {
    expect(formatDuration(42)).toBe('42 h')
  })

  it('formate une durée courte en minutes', () => {
    expect(formatDuration(0.5)).toBe('30 min')
  })
})
