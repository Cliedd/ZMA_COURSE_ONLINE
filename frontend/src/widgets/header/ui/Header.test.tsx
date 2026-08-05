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
    expect(within(nav).getByRole('button', { name: /Courses/ })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: /Teachers/ })).toBeInTheDocument()
  })

  it('propose Log in et Sign up', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/auth/login')
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/auth/register')
  })

  it('déploie le menu Courses et pointe vers des catalogues filtrés', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: /Courses/ }))
    const menu = await screen.findByRole('menu')
    const item = within(menu).getByRole('menuitem', { name: /Performance/ })
    expect(item).toHaveAttribute(
      'href',
      `/catalogue?department=${encodeURIComponent('Performance & Instrumental Practice')}`,
    )
  })

  it('offre un lien d\'évitement en première position', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#contenu')
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = renderHeader()
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Header — navigation mobile', () => {
  it('expose un déclencheur de menu, absent du frontend actuel', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })

  it('ouvre un tiroir contenant la navigation complète', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const drawer = await screen.findByRole('dialog', { name: 'Navigation' })
    expect(within(drawer).getByRole('link', { name: /Performance/ })).toBeInTheDocument()
    expect(within(drawer).getByRole('link', { name: 'Log in' })).toBeInTheDocument()
  })

  it('ferme le tiroir avec la touche Échap', async () => {
    renderHeader()
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
