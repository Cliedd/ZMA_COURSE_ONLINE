import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { useCatalogFilters } from './model/useCatalogFilters'
import { FilterBar } from './ui/FilterBar'

function Harness() {
  const { filters, setFilter } = useCatalogFilters()
  const location = useLocation()
  return (
    <>
      <span data-testid="search">{location.search}</span>
      <FilterBar filters={filters} onSetFilter={setFilter} />
    </>
  )
}

function renderAt(initial = '/catalogue') {
  return render(<MemoryRouter initialEntries={[initial]}><Harness /></MemoryRouter>)
}

describe('useCatalogFilters + FilterBar', () => {
  it('lit les filtres depuis l\'URL', () => {
    renderAt(`/catalogue?level=${encodeURIComponent("Master's")}`)
    expect(screen.getByRole('button', { name: "Master's" })).toHaveAttribute('aria-pressed', 'true')
  })

  it('pose un niveau dans l\'URL au clic sur une puce', async () => {
    renderAt()
    await userEvent.click(screen.getByRole('button', { name: "Bachelor's" }))
    expect(screen.getByTestId('search').textContent).toContain('level=Bachelor%27s')
  })

  it('pose un département encodé dans l\'URL', async () => {
    renderAt()
    await userEvent.click(screen.getByRole('button', { name: 'Performance' }))
    expect(screen.getByTestId('search').textContent).toContain('department=Performance')
  })

  it('retire le filtre au clic sur « Tous »', async () => {
    renderAt(`/catalogue?level=${encodeURIComponent("Master's")}`)
    const allButtons = screen.getAllByRole('button', { name: 'All' })
    await userEvent.click(allButtons[0]!)
    expect(screen.getByTestId('search').textContent).not.toContain('level=')
  })

  // Régression : deux setFilter() déclenchés coup sur coup, sans qu'un rendu ne s'intercale
  // entre les deux (ex. deux clics très rapprochés), ne doivent PAS s'écraser l'un l'autre.
  // Avant le correctif, setFilter fermait sur `params` capturé au rendu ; la seconde mise à
  // jour repartait d'un instantané périmé et effaçait silencieusement la première.
  it('combine département + niveau même quand les deux mises à jour sont déclenchées avant tout re-rendu', () => {
    renderAt()
    const deptButton = screen.getByRole('button', { name: 'Performance' })
    const levelButton = screen.getByRole('button', { name: "Bachelor's" })

    act(() => {
      fireEvent.click(deptButton)
      fireEvent.click(levelButton)
    })

    const search = screen.getByTestId('search').textContent ?? ''
    expect(search).toContain('department=Performance')
    expect(search).toContain('level=Bachelor%27s')
  })
})
