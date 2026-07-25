import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider, useTheme } from './ThemeProvider'

function Probe() {
  const { theme, resolved, setTheme } = useTheme()
  return (
    <>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolved}</span>
      <button onClick={() => setTheme('dark')}>sombre</button>
      <button onClick={() => setTheme('light')}>clair</button>
    </>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('démarre en mode système et se résout en clair quand le système est clair', () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')
  })

  it('pose data-theme="dark" sur <html> au passage en sombre', async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'sombre' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
  })

  it('persiste le choix dans localStorage', async () => {
    render(<ThemeProvider><Probe /></ThemeProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'sombre' }))
    expect(localStorage.getItem('zma-theme')).toBe('dark')
  })

  it('relit le choix persisté au montage', () => {
    localStorage.setItem('zma-theme', 'dark')
    render(<ThemeProvider><Probe /></ThemeProvider>)
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('lève une erreur explicite si useTheme est appelé hors du fournisseur', () => {
    expect(() => render(<Probe />)).toThrow('useTheme doit être utilisé dans un ThemeProvider')
  })
})
