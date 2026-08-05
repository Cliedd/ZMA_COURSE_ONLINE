import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import { describe, it, expect, beforeEach } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/shared/config/i18n'
import { Header } from './Header'
import { ThemeProvider } from '@/shared/theme'
import { useAuthStore } from '@/entities/session'

function renderHeader() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <ThemeProvider><Header /></ThemeProvider>
      </MemoryRouter>
    </I18nextProvider>,
  )
}

beforeEach(() => {
  useAuthStore.getState().logout()
  localStorage.clear()
})

describe('Header — visiteur', () => {
  it('affiche les entrées principales', () => {
    renderHeader()
    const nav = screen.getByRole('navigation', { name: /principale|main/i })
    expect(within(nav).getByRole('button', { name: /Formations|Courses/i })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /Enseignants|Teachers/i })).toBeInTheDocument()
  })

  it('propose Log in et Sign up', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: /Connexion|Log in/i })).toHaveAttribute('href', '/auth/login')
    expect(screen.getByRole('link', { name: /S'inscrire|Sign up/i })).toHaveAttribute('href', '/auth/register')
  })

  it('déploie le menu Courses et pointe vers des catalogues filtrés', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: /Formations|Courses/i }))
    const menu = await screen.findByRole('menu')
    const item = within(menu).getByRole('menuitem', { name: /Interprétation|Performance/i })
    expect(item).toHaveAttribute(
      'href',
      `/catalogue?department=${encodeURIComponent('Performance & Instrumental Practice')}`,
    )
  })

  it('offre un lien d\'évitement en première position', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: /Aller au contenu|Skip to content/i })).toHaveAttribute('href', '#contenu')
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = renderHeader()
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Header — navigation mobile', () => {
  it('expose un déclencheur de menu', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: /Ouvrir le menu|Open menu/i })).toBeInTheDocument()
  })

  it('ouvre un tiroir contenant la navigation complète', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: /Ouvrir le menu|Open menu/i }))
    const drawer = await screen.findByRole('dialog', { name: /Navigation/i })
    expect(within(drawer).getByRole('link', { name: /Interprétation|Performance/i })).toBeInTheDocument()
    expect(within(drawer).getByRole('link', { name: /Connexion|Log in/i })).toBeInTheDocument()
  })

  it('ferme le tiroir avec la touche Échap', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: /Ouvrir le menu|Open menu/i }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
