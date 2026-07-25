import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'
import { mswServer } from './msw'
// Initialise i18next (effet de bord du module) : requis par tout composant
// utilisant useTranslation(), Vitest isolant le registre de modules par fichier de test.
import '@/shared/config/i18n'

expect.extend(toHaveNoViolations)

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  mswServer.resetHandlers()
})
afterAll(() => mswServer.close())

// jsdom n'implémente pas matchMedia — requis par le fournisseur de thème (tâche 4)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
