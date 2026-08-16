import { z } from 'zod'
import { post } from '@/shared/api/http'
import type { AuthResponse } from '../model/authStore'

const authResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string().nullish().transform((v) => v ?? ''),
  email: z.string().nullish().transform((v) => v ?? ''),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).nullish().transform((v) => v ?? 'STUDENT'),
  id: z.string().nullish().transform((v) => v ?? ''),
  expiresIn: z.number().nullish().transform((v) => v ?? 3600),
})

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    post('/auth/login', { email, password }, authResponseSchema),
  register: (email: string, password: string): Promise<{ message?: string }> =>
    post('/auth/register', { email, password }),
  forgotPassword: (email: string): Promise<{ message?: string }> =>
    post('/auth/forgot-password', { email }),
  resetPassword: (resetToken: string, newPassword: string): Promise<{ message?: string }> =>
    post('/auth/reset-password', { resetToken, newPassword }),
  resendVerification: (email: string): Promise<{ message?: string }> =>
    post('/auth/resend-verification', { email }),
}

