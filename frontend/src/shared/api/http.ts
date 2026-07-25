import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosInstance } from 'axios'
import type { ZodType } from 'zod'
import { useAuthStore } from '@/entities/session'
import type { AuthResponse } from '@/entities/session'

/** Forme unique d'erreur dans toute l'application. */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fieldErrors?: Record<string, string>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

type UnauthorizedHandler = (context: { returnTo: string }) => void

let onUnauthorized: UnauthorizedHandler = ({ returnTo }) => {
  window.location.assign(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)
}

/** Permet au routeur (tâche 12) de rediriger sans rechargement complet. */
export function setOnUnauthorized(handler: UnauthorizedHandler): void {
  onUnauthorized = handler
}

interface RetriableConfig extends AxiosRequestConfig {
  _retried?: boolean
}

const client: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

interface ErrorBody {
  message?: string
  code?: string
  fieldErrors?: Record<string, string>
}

function toAppError(error: AxiosError<ErrorBody>): AppError {
  if (!error.response) {
    return new AppError(0, 'NETWORK', 'Connexion impossible. Vérifiez votre réseau et réessayez.')
  }
  const { status, data } = error.response
  return new AppError(
    status,
    data?.code ?? `HTTP_${status}`,
    data?.message ?? 'Une erreur est survenue.',
    data?.fieldErrors,
  )
}

/** Rafraîchit la session. Renvoie true si un nouveau jeton a été obtenu. */
async function refreshSession(): Promise<boolean> {
  const { refreshToken, setSession } = useAuthStore.getState()
  if (!refreshToken) return false
  try {
    const { data } = await axios.post<AuthResponse>('/api/v1/auth/refresh', { refreshToken })
    setSession(data)
    return true
  } catch {
    return false
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorBody>) => {
    const config = error.config as RetriableConfig | undefined
    const isRefreshCall = config?.url?.includes('/auth/refresh') ?? false

    if (error.response?.status === 401 && config && !config._retried && !isRefreshCall) {
      config._retried = true
      if (await refreshSession()) return client(config)

      // Le rafraîchissement a échoué : on sort proprement en mémorisant la page.
      if (useAuthStore.getState().token) {
        useAuthStore.getState().logout()
        onUnauthorized({ returnTo: window.location.pathname })
      }
    }
    throw toAppError(error)
  },
)

async function request<T>(config: AxiosRequestConfig, schema?: ZodType<T>): Promise<T> {
  const { data } = await client.request<unknown>(config)
  if (!schema) return data as T
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new AppError(
      200,
      'SCHEMA_MISMATCH',
      `Réponse inattendue du serveur pour ${config.url ?? 'la requête'}.`,
    )
  }
  return parsed.data
}

export const get = <T>(url: string, config?: AxiosRequestConfig, schema?: ZodType<T>) =>
  request<T>({ ...config, url, method: 'GET' }, schema)

export const post = <T>(url: string, data?: unknown, schema?: ZodType<T>, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: 'POST', data }, schema)

export const put = <T>(url: string, data?: unknown, schema?: ZodType<T>, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: 'PUT', data }, schema)

export const patch = <T>(url: string, data?: unknown, schema?: ZodType<T>, config?: AxiosRequestConfig) =>
  request<T>({ ...config, url, method: 'PATCH', data }, schema)

export const del = <T>(url: string, config?: AxiosRequestConfig, schema?: ZodType<T>) =>
  request<T>({ ...config, url, method: 'DELETE' }, schema)
