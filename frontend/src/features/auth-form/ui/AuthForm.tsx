import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Field, Input, Button } from '@/shared/ui'
import { authApi, useAuthStore } from '@/entities/session'
import { AppError } from '@/shared/api/http'

const schema = z.object({
  email: z.string().email('auth.invalidEmail'),
  password: z.string().min(8, 'auth.pwdMin'),
})
type Values = z.infer<typeof schema>

/** Formulaire d'authentification partagé (connexion / inscription). */
export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)
  const [formError, setFormError] = useState<string | null>(null)

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null)
    try {
      if (mode === 'login') {
        const res = await authApi.login(email, password)
        setSession(res)
        navigate(params.get('returnTo') || '/dashboard', { replace: true })
      } else {
        await authApi.register(email, password)
        navigate('/auth/login', { replace: true, state: { registered: true } })
      }
    } catch (e) {
      if (e instanceof AppError && e.fieldErrors) {
        for (const [k, v] of Object.entries(e.fieldErrors)) setError(k as keyof Values, { message: v })
      } else {
        setFormError(e instanceof AppError ? e.message : 'Erreur')
      }
    }
  })

  return (
    <div>
      <h1 className="font-serif text-h1 text-ink">{t(mode === 'login' ? 'auth.loginTitle' : 'auth.registerTitle')}</h1>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5" noValidate>
        <Field name="email" label={t('auth.email')} error={errors.email && t(errors.email.message ?? '')}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field name="password" label={t('auth.password')} hint={t('auth.pwdHint')} error={errors.password && t(errors.password.message ?? '')}>
          <Input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} {...register('password')} />
        </Field>

        {formError && <p role="alert" className="font-sans text-sm text-danger">{formError}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {t(mode === 'login' ? 'auth.login' : 'auth.register')}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-ink-faint">
        <span className="h-px flex-1 bg-line" /><span className="font-sans text-sm">{t('auth.or')}</span><span className="h-px flex-1 bg-line" />
      </div>

      <a href="/oauth2/authorization/google" className="flex min-h-touch w-full items-center justify-center rounded border border-line font-sans text-sm font-semibold text-ink hover:bg-paper">
        {t('auth.google')}
      </a>

      <p className="mt-6 text-center font-sans text-sm text-ink-muted">
        {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
        <Link to={mode === 'login' ? '/auth/register' : '/auth/login'} className="font-semibold text-blue hover:underline">
          {t(mode === 'login' ? 'auth.toRegister' : 'auth.toLogin')}
        </Link>
      </p>
    </div>
  )
}
