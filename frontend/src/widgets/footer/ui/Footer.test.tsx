import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { Footer } from './Footer'
import { DEPARTMENTS } from '@/shared/config/navigation'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  it('affiche la marque et l\'année courante', () => {
    renderFooter()
    expect(screen.getAllByText(/ZTF Music Académie/).length).toBeGreaterThan(0)
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument()
  })

  it('liste les départements comme liens de catalogue', () => {
    renderFooter()
    const footer = screen.getByRole('contentinfo')
    for (const dept of DEPARTMENTS) {
      expect(within(footer).getByRole('link', { name: dept.label })).toHaveAttribute('href', dept.to)
    }
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = renderFooter()
    expect(await axe(container)).toHaveNoViolations()
  })
})
