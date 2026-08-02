import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { computeCountdown, LaunchCountdownSection } from './LaunchCountdownSection'

describe('computeCountdown', () => {
  it('décompose un écart de 60 jours pile en 60j/0h/0m/0s', () => {
    const target = new Date('2026-10-01T00:00:00Z')
    const now = new Date('2026-08-02T00:00:00Z')
    expect(computeCountdown(target, now)).toEqual({ days: 60, hours: 0, minutes: 0, seconds: 0, reached: false })
  })

  it('décompose un écart partiel (2j 3h 4m 5s)', () => {
    const target = new Date('2026-10-01T00:00:00Z')
    // 2 jours 3 heures 4 minutes 5 secondes avant la cible
    const now = new Date(target.getTime() - (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000)
    expect(computeCountdown(target, now)).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5, reached: false })
  })

  it('plafonne à zéro pile à l’échéance', () => {
    const target = new Date('2026-10-01T00:00:00Z')
    expect(computeCountdown(target, target)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, reached: true })
  })

  it('reste à zéro et ne devient jamais négatif après l’échéance', () => {
    const target = new Date('2026-10-01T00:00:00Z')
    const later = new Date(target.getTime() + 5 * 86400 * 1000)
    expect(computeCountdown(target, later)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, reached: true })
  })
})

describe('LaunchCountdownSection', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('affiche les quatre unités et se met à jour chaque seconde', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-02T00:00:00Z'))

    renderWithProviders(<LaunchCountdownSection />)

    expect(screen.getByText('Courses launch in')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Countdown to course launch' })).toBeInTheDocument()

    expect(screen.getByTestId('countdown-days')).toHaveTextContent('60')
    expect(screen.getByTestId('countdown-seconds')).toHaveTextContent('00')

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId('countdown-days')).toHaveTextContent('59')
    expect(screen.getByTestId('countdown-seconds')).toHaveTextContent('59')
  })
})
