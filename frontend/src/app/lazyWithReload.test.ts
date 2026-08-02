import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHUNK_RELOAD_FLAG_KEY, isChunkLoadError, reloadOnceForChunkError } from './lazyWithReload'

describe('isChunkLoadError', () => {
  it('reconnaît le message exact rapporté en production (Vite/Rollup, Chrome)', () => {
    expect(
      isChunkLoadError(
        new Error(
          "Failed to fetch dynamically imported module: https://golden-begonia-321988.netlify.app/assets/index-Cpo1QF09.js",
        ),
      ),
    ).toBe(true)
  })

  it('reconnaît les variantes Webpack et Safari/Firefox', () => {
    expect(isChunkLoadError(new Error('Loading chunk 42 failed.'))).toBe(true)
    expect(isChunkLoadError(new Error('Loading CSS chunk 7 failed.'))).toBe(true)
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true)
    expect(isChunkLoadError(new TypeError('Importing a module script failed'))).toBe(true)
    expect(isChunkLoadError(new Error('Unable to preload CSS for /assets/index-abc123.css'))).toBe(true)
  })

  it('ne se déclenche pas sur une erreur applicative sans rapport', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined (reading "map")'))).toBe(false)
    expect(isChunkLoadError(new TypeError('NetworkError when attempting to fetch resource.'))).toBe(false)
    expect(isChunkLoadError(new Error('Identifiants invalides'))).toBe(false)
  })

  it('gère les valeurs non-Error (rejets bruts, undefined) sans lever', () => {
    expect(isChunkLoadError(undefined)).toBe(false)
    expect(isChunkLoadError(null)).toBe(false)
    expect(isChunkLoadError('Failed to fetch dynamically imported module: foo.js')).toBe(true)
    expect(isChunkLoadError('une chaîne quelconque')).toBe(false)
  })
})

describe('reloadOnceForChunkError', () => {
  const originalLocation = window.location

  beforeEach(() => {
    sessionStorage.clear()
    // jsdom ne supporte pas window.location.reload() nativement.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: vi.fn() },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  it('recharge la page une première fois pour une erreur de chunk périmé', () => {
    const triggered = reloadOnceForChunkError(
      new Error('Failed to fetch dynamically imported module: /assets/index-abc.js'),
    )
    expect(triggered).toBe(true)
    expect(window.location.reload).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem(CHUNK_RELOAD_FLAG_KEY)).toBe('1')
  })

  it('ne recharge pas deux fois dans le même onglet — pas de boucle infinie', () => {
    reloadOnceForChunkError(new Error('Failed to fetch dynamically imported module: /assets/a.js'))
    const secondAttempt = reloadOnceForChunkError(
      new Error('Failed to fetch dynamically imported module: /assets/b.js'),
    )
    expect(secondAttempt).toBe(false)
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  it('ne recharge jamais pour une erreur qui n\'est pas liée aux chunks', () => {
    const triggered = reloadOnceForChunkError(new Error('Identifiants invalides'))
    expect(triggered).toBe(false)
    expect(window.location.reload).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(CHUNK_RELOAD_FLAG_KEY)).toBeNull()
  })
})
