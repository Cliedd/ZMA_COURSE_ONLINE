import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, beforeAll, afterAll, expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'
import { mswServer } from './msw'
// Initialise i18next (effet de bord du module) : requis par tout composant
// utilisant useTranslation(), Vitest isolant le registre de modules par fichier de test.
import '@/shared/config/i18n'

// axios's XHR adapter calls setTimeout(onloadend) for every response, adding at
// least one macro-task tick per HTTP round-trip.  On a loaded CI machine (Node 20+)
// each tick can take 100–300 ms; a two-request upload flow (presign + upload-direct)
// therefore often exceeds Testing Library's default 1 000 ms async timeout.
// Raising it to 8 000 ms keeps tests reliable without making them slow locally.
configure({ asyncUtilTimeout: 8000 })

expect.extend(toHaveNoViolations)

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  cleanup()
  mswServer.resetHandlers()
})
afterAll(() => mswServer.close())

// jsdom lève "Not implemented: navigation" sur toute assignation de window.location.href
// (redirection externe, ex. gateway de paiement). Sur Node 20+, Vitest attrape cette
// erreur synchrone comme un échec de test. On remplace href par un setter no-op.
Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    ...window.location,
    assign: () => {},
    replace: () => {},
    reload: () => {},
    get href() { return 'http://localhost/' },
    set href(_url: string) { /* no-op — navigation non implémentée en jsdom */ },
  },
})

// jsdom n'implémente pas matchMedia — requis par le fournisseur de thème (tâche 4)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
})

// jsdom n'implémente pas IntersectionObserver — requis par framer-motion (whileInView),
// utilisé par le composant BlurFade (chantier 6, clone visuel du confrère).
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  takeRecords = (): IntersectionObserverEntry[] => []
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})
