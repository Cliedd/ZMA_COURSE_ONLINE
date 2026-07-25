import { http, HttpResponse } from 'msw'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { z } from 'zod'
import { mswServer } from '@/test/msw'
import { AppError, get, post } from './http'
import { useAuthStore, connectSessionToHttp } from '@/entities/session'

const API = 'http://localhost/api/v1'

/** JWT non signé, valide jusqu'en 2099 — suffisant pour authStore qui ne lit que exp/sub/role. */
function fakeJwt(exp = 4102444800): string {
  const payload = btoa(JSON.stringify({ sub: 'etudiant@ztf.cm', role: 'STUDENT', exp }))
  return `header.${payload}.signature`
}

beforeEach(() => {
  // Rebranche la session réelle au client HTTP (injection de dépendance FSD).
  connectSessionToHttp()
  useAuthStore.getState().logout()
  localStorage.clear()
})

describe('get', () => {
  it('renvoie la donnée validée par le schéma', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.json([{ id: '1', title: 'Piano' }])))
    const schema = z.array(z.object({ id: z.string(), title: z.string() }))
    await expect(get('/courses', undefined, schema)).resolves.toEqual([{ id: '1', title: 'Piano' }])
  })

  it('lève une AppError si la réponse ne correspond pas au schéma', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.json([{ id: 1 }])))
    const schema = z.array(z.object({ id: z.string(), title: z.string() }))
    await expect(get('/courses', undefined, schema)).rejects.toBeInstanceOf(AppError)
  })

  it('joint le jeton d\'authentification quand la session existe', async () => {
    useAuthStore.getState().setSession({ token: fakeJwt(), refreshToken: 'r1', email: 'e@z.cm', role: 'STUDENT', id: '1', expiresIn: 3600 })
    let seen: string | null = null
    mswServer.use(http.get(`${API}/me`, ({ request }) => {
      seen = request.headers.get('Authorization')
      return HttpResponse.json({ ok: true })
    }))
    await get('/me')
    expect(seen).toBe(`Bearer ${fakeJwt()}`)
  })
})

describe('normalisation des erreurs', () => {
  it('transforme une erreur HTTP en AppError avec son statut', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.json({ message: 'Cours introuvable' }, { status: 404 })))
    await expect(get('/courses')).rejects.toMatchObject({ status: 404, message: 'Cours introuvable' })
  })

  it('remonte les erreurs de champ renvoyées par Spring', async () => {
    mswServer.use(http.post(`${API}/auth/register`, () =>
      HttpResponse.json({ message: 'Validation échouée', fieldErrors: { email: 'Adresse déjà utilisée' } }, { status: 400 }),
    ))
    await expect(post('/auth/register', {})).rejects.toMatchObject({
      status: 400,
      fieldErrors: { email: 'Adresse déjà utilisée' },
    })
  })

  it('donne un message lisible quand le réseau est injoignable', async () => {
    mswServer.use(http.get(`${API}/courses`, () => HttpResponse.error()))
    await expect(get('/courses')).rejects.toMatchObject({ status: 0, code: 'NETWORK' })
  })
})

describe('rafraîchissement de session sur 401', () => {
  it('rafraîchit le jeton puis rejoue la requête une seule fois', async () => {
    useAuthStore.getState().setSession({ token: fakeJwt(1), refreshToken: 'refresh-1', email: 'e@z.cm', role: 'STUDENT', id: '1', expiresIn: 0 })
    let attempts = 0
    mswServer.use(
      http.get(`${API}/enrollments/me`, () => {
        attempts += 1
        return attempts === 1
          ? HttpResponse.json({ message: 'Expired' }, { status: 401 })
          : HttpResponse.json([{ id: 'e1' }])
      }),
      http.post(`${API}/auth/refresh`, () =>
        HttpResponse.json({ token: fakeJwt(), refreshToken: 'refresh-2', email: 'e@z.cm', role: 'STUDENT', id: '1', expiresIn: 3600 }),
      ),
    )

    await expect(get('/enrollments/me')).resolves.toEqual([{ id: 'e1' }])
    expect(attempts).toBe(2)
    expect(useAuthStore.getState().refreshToken).toBe('refresh-2')
  })

  it('déconnecte et mémorise la page en cours quand le rafraîchissement échoue', async () => {
    useAuthStore.getState().setSession({ token: fakeJwt(1), refreshToken: 'perime', email: 'e@z.cm', role: 'STUDENT', id: '1', expiresIn: 0 })
    const onUnauthorized = vi.fn()
    mswServer.use(
      http.get(`${API}/enrollments/me`, () => HttpResponse.json({ message: 'Expired' }, { status: 401 })),
      http.post(`${API}/auth/refresh`, () => HttpResponse.json({ message: 'Invalid' }, { status: 401 })),
    )

    const { setOnUnauthorized } = await import('./http')
    setOnUnauthorized(onUnauthorized)

    await expect(get('/enrollments/me')).rejects.toBeInstanceOf(AppError)
    expect(useAuthStore.getState().token).toBeNull()
    expect(onUnauthorized).toHaveBeenCalledWith({ returnTo: '/' })
  })

  it('ne tente pas de rafraîchir quand aucune session n\'existe', async () => {
    let refreshCalls = 0
    mswServer.use(
      http.get(`${API}/enrollments/me`, () => HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })),
      http.post(`${API}/auth/refresh`, () => { refreshCalls += 1; return HttpResponse.json({}, { status: 401 }) }),
    )
    await expect(get('/enrollments/me')).rejects.toMatchObject({ status: 401 })
    expect(refreshCalls).toBe(0)
  })
})
