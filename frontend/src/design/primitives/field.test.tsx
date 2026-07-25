import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, it, expect } from 'vitest'
import { Field, Input } from './index'

describe('Field', () => {
  it('relie le libellé au champ', () => {
    render(<Field name="email" label="Adresse électronique"><Input type="email" /></Field>)
    expect(screen.getByLabelText('Adresse électronique')).toBeInstanceOf(HTMLInputElement)
  })

  it('marque le champ invalide et le relie à son message d\'erreur', () => {
    render(
      <Field name="email" label="Adresse électronique" error="Adresse déjà utilisée">
        <Input type="email" />
      </Field>,
    )
    const input = screen.getByLabelText('Adresse électronique')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Adresse déjà utilisée')
  })

  it('annonce l\'erreur aux lecteurs d\'écran', () => {
    render(<Field name="email" label="Courriel" error="Format invalide"><Input /></Field>)
    expect(screen.getByRole('alert')).toHaveTextContent('Format invalide')
  })

  it('relie l\'indication au champ quand il n\'y a pas d\'erreur', () => {
    render(<Field name="password" label="Mot de passe" hint="Au moins 8 caractères"><Input type="password" /></Field>)
    expect(screen.getByLabelText('Mot de passe')).toHaveAccessibleDescription('Au moins 8 caractères')
  })

  it('signale un champ obligatoire au clavier comme à l\'écran', () => {
    render(<Field name="email" label="Courriel" required><Input /></Field>)
    expect(screen.getByLabelText(/Courriel/)).toBeRequired()
  })

  it('n\'a aucune violation d\'accessibilité, même en erreur', async () => {
    const { container } = render(
      <Field name="email" label="Courriel" error="Format invalide"><Input type="email" /></Field>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
