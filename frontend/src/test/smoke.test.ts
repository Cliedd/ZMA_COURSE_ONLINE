import { describe, it, expect } from 'vitest'

describe('harnais de tests', () => {
  it('exécute les tests dans un environnement jsdom', () => {
    expect(typeof document).toBe('object')
    expect(document.createElement('div')).toBeInstanceOf(HTMLElement)
  })

  it('expose les matchers jest-dom', () => {
    const el = document.createElement('button')
    el.textContent = 'Explorer'
    document.body.appendChild(el)
    expect(el).toBeVisible()
    expect(el).toHaveTextContent('Explorer')
  })

  it('résout l\'alias matchMedia utilisé par le fournisseur de thème', () => {
    expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(false)
  })
})
