import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import { describe, it, expect, beforeEach } from 'vitest'
import { Header } from './Header'
import { ThemeProvider } from '@/shared/theme'
import { useAuthStore } from '@/entities/session'

function renderHeader() {
  return render(
    <MemoryRouter>
      <ThemeProvider><Header /></ThemeProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuthStore.getState().logout()
  localStorage.clear()
})

describe('Header — visiteur', () => {
  it('affiche les entrées principales', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: /principale/i })
    expect(within(nav).getByRole('button', { name: /Formations/ })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /Enseignants/ })).toBeInTheDocument()
  })

  it('propose Connexion et Inscription', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Connexion' })).toHaveAttribute('href', '/auth/login')
    expect(screen.getByRole('link', { name: "S'inscrire" })).toHaveAttribute('href', '/auth/register')
  })

  it('déploie le menu Formations et pointe vers des catalogues filtrés', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: /Formations/ }))
    const menu = await screen.findByRole('menu')
    const item = within(menu).getByRole('menuitem', { name: /Interprétation/ })
    expect(item).toHaveAttribute('href', '/catalogue?department=Interpr%C3%A9tation')
  })

  it('offre un lien d\'évitement en première position', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Aller au contenu' })).toHaveAttribute('href', '#contenu')
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = renderHeader()
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Header — navigation mobile', () => {
  it('expose un déclencheur de menu, absent du frontend actuel', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'Ouvrir le menu' })).toBeInTheDocument()
  })

  it('ouvre un tiroir contenant la navigation complète', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }))
    const drawer = await screen.findByRole('dialog', { name: 'Navigation' })
    expect(within(drawer).getByRole('link', { name: /Interprétation/ })).toBeInTheDocument()
    expect(within(drawer).getByRole('link', { name: 'Connexion' })).toBeInTheDocument()
  })

  it('ferme le tiroir avec la touche Échap', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
