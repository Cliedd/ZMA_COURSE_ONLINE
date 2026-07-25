import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Picture } from './index'
import { IMAGES } from '@/design/images/manifest'

describe('Picture', () => {
  it('déclare les dimensions, ce qui met le CLS à zéro', () => {
    render(<Picture image={IMAGES.heroStage} sizes="100vw" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', String(IMAGES.heroStage.width))
    expect(img).toHaveAttribute('height', String(IMAGES.heroStage.height))
  })

  it('propose AVIF puis WebP avant le JPEG de repli', () => {
    const { container } = render(<Picture image={IMAGES.heroStage} sizes="100vw" />)
    const types = Array.from(container.querySelectorAll('source')).map((s) => s.getAttribute('type'))
    expect(types).toEqual(['image/avif', 'image/webp'])
  })

  it('génère un srcset en quatre largeurs', () => {
    const { container } = render(<Picture image={IMAGES.heroStage} sizes="100vw" />)
    const avif = container.querySelector('source[type="image/avif"]')
    expect(avif?.getAttribute('srcset')).toContain('400w')
    expect(avif?.getAttribute('srcset')).toContain('1600w')
  })

  it('charge en différé par défaut', () => {
    render(<Picture image={IMAGES.studioDesk} sizes="400px" />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy')
  })

  it('charge en priorité quand priority est demandé — pour l\'image du LCP', () => {
    render(<Picture image={IMAGES.heroStage} sizes="100vw" priority />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('reprend le texte alternatif du manifeste', () => {
    render(<Picture image={IMAGES.heroStage} sizes="100vw" />)
    expect(screen.getByRole('img')).toHaveAccessibleName(IMAGES.heroStage.alt)
  })

  it('accepte un alt vide pour une image purement décorative', () => {
    const { container } = render(<Picture image={IMAGES.heroStage} sizes="100vw" alt="" />)
    expect(container.querySelector('img')).toHaveAttribute('alt', '')
  })
})

describe('manifeste', () => {
  it('marque les emplacements en attente du matériel ZTF', () => {
    const pending = Object.values(IMAGES).filter((i) => i.source === 'ztf-pending')
    expect(pending.length).toBeGreaterThan(0)
  })

  it('donne un texte alternatif non vide à chaque entrée', () => {
    for (const [key, entry] of Object.entries(IMAGES)) {
      expect(entry.alt.length, `alt manquant pour ${key}`).toBeGreaterThan(0)
    }
  })
})
