import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { Breadcrumb } from './Breadcrumb'

describe('Breadcrumb', () => {
  it('rend une liste ordonnée dans une navigation nommée', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={[{ label: 'Formations', to: '/catalogue' }, { label: 'Piano classique' }]} />
      </MemoryRouter>,
    )
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3)
  })

  it('marque la page courante et n\'en fait pas un lien', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={[{ label: 'Formations', to: '/catalogue' }, { label: 'Piano classique' }]} />
      </MemoryRouter>,
    )
    const current = screen.getByText('Piano classique')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Piano classique' })).not.toBeInTheDocument()
  })

  it('ajoute toujours Accueil en tête', () => {
    render(<MemoryRouter><Breadcrumb items={[{ label: 'Formations' }]} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = render(
      <MemoryRouter><Breadcrumb items={[{ label: 'Formations', to: '/catalogue' }, { label: 'Piano' }]} /></MemoryRouter>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
