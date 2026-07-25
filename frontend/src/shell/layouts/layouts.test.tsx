import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { PublicLayout } from './PublicLayout'
import { AppLayout } from './AppLayout'
import { AuthLayout } from './AuthLayout'
import { ImmersiveLayout } from './ImmersiveLayout'
import { ThemeProvider } from '@/shared/theme'

/** Monte un gabarit avec une route enfant qui rend un contenu témoin. */
function renderLayout(layout: React.ReactElement, initial = '/') {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <ThemeProvider>
        <Routes>
          <Route element={layout}>
            <Route path="/" element={<p>Contenu témoin</p>} />
          </Route>
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('PublicLayout', () => {
  it('rend le contenu, l\'en-tête et le pied de page', () => {
    renderLayout(<PublicLayout />)
    expect(screen.getByText('Contenu témoin')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument() // <header>
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // <footer>
  })

  it('expose une zone principale ciblable par le lien d\'évitement', () => {
    renderLayout(<PublicLayout />)
    expect(document.getElementById('contenu')).not.toBeNull()
  })
})

describe('AppLayout', () => {
  it('rend le contenu et l\'en-tête, sans pied de page marketing', () => {
    renderLayout(<AppLayout />)
    expect(screen.getByText('Contenu témoin')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })
})

describe('AuthLayout', () => {
  it('rend le contenu sans navigation (on ne détourne pas une inscription)', () => {
    renderLayout(<AuthLayout />)
    expect(screen.getByText('Contenu témoin')).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})

describe('ImmersiveLayout', () => {
  it('rend le contenu en registre sombre et offre une sortie', () => {
    const { container } = renderLayout(<ImmersiveLayout />)
    expect(screen.getByText('Contenu témoin')).toBeInTheDocument()
    expect(container.querySelector('[data-theme="dark"]')).not.toBeNull()
    // Sortie toujours visible (retour vers Mes cours).
    expect(screen.getByRole('link', { name: /mes cours/i })).toBeInTheDocument()
  })
})
