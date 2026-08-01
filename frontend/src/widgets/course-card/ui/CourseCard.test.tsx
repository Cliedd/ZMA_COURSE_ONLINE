import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { CourseCard } from './CourseCard'
import { courseSchema } from '@/entities/course'

function makeCourse(over: Record<string, unknown> = {}) {
  return courseSchema.parse({ id: '1', slug: 'piano', title: 'Piano classique & harmonie', ...over })
}

function renderCard(over?: Record<string, unknown>) {
  return render(<MemoryRouter><CourseCard course={makeCourse(over)} /></MemoryRouter>)
}

describe('CourseCard', () => {
  it('pointe vers la fiche du cours', () => {
    renderCard()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/course/piano')
  })

  it('affiche le titre et le niveau', () => {
    renderCard({ level: 'Licence', department: 'Interprétation' })
    expect(screen.getByRole('heading', { name: /Piano classique/ })).toBeInTheDocument()
    expect(screen.getByText(/Bachelor's · Performance/)).toBeInTheDocument()
  })

  it('affiche le prix quand il est positif', () => {
    renderCard({ price: 18 })
    expect(screen.getByText(/18/)).toBeInTheDocument()
  })

  it('affiche « Aperçu gratuit » quand le cours n\'a pas de note', () => {
    renderCard({ rating: null })
    expect(screen.getByText('Free preview')).toBeInTheDocument()
  })

  it('affiche la note quand elle existe', () => {
    renderCard({ rating: 4.9, studentsCount: 312 })
    expect(screen.getByText('4.9')).toBeInTheDocument()
  })

  it('n\'a aucune violation d\'accessibilité', async () => {
    const { container } = renderCard({ price: 18, rating: 4.9 })
    expect(await axe(container)).toHaveNoViolations()
  })
})
