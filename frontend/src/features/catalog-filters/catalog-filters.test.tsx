import { render, screen } from '@testing-library/react'
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
    renderAt('/catalogue?level=Master')
    expect(screen.getByRole('button', { name: 'Master' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('pose un niveau dans l\'URL au clic sur une puce', async () => {
    renderAt()
    await userEvent.click(screen.getByRole('button', { name: 'Licence' }))
    expect(screen.getByTestId('search').textContent).toContain('level=Licence')
  })

  it('pose un département encodé dans l\'URL', async () => {
    renderAt()
    await userEvent.click(screen.getByRole('button', { name: 'Interprétation' }))
    expect(screen.getByTestId('search').textContent).toContain('department=Interpr')
  })

  it('retire le filtre au clic sur « Tous »', async () => {
    renderAt('/catalogue?level=Master')
    const allButtons = screen.getAllByRole('button', { name: 'Tous' })
    await userEvent.click(allButtons[0]!)
    expect(screen.getByTestId('search').textContent).not.toContain('level=')
  })
})
