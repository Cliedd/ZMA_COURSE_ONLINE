import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Field, Input, Button, toast } from '@/shared/ui'
import { authApi, useAuthStore } from '@/entities/session'
import { AppError } from '@/shared/api/http'
import { GoogleIcon } from './GoogleIcon'

const schema = z.object({
  email: z.string().email('auth.invalidEmail'),
  password: z.string().optional(),
})
type Values = z.infer<typeof schema>

/** Formulaire d'authentification partagé (connexion / inscription / mot de passe oublié). */
export function AuthForm({ mode: initialMode }: { mode: 'login' | 'register' | 'forgot' }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode)
  const [formError, setFormError] = useState<string | null>(null)
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false)
  const [showResendVerification, setShowResendVerification] = useState<boolean>(false)
  const [resendEmail, setResendEmail] = useState<string>('')

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null)
    setForgotSuccess(false)
    setShowResendVerification(false)
    try {
      if (mode === 'login') {
        if (!password || password.length < 8) {
          setError('password', { message: 'auth.pwdMin' })
          return
        }
        const res = await authApi.login(email, password)
        setSession(res)
        toast.success(t('auth.welcomeToastBody', { email: res.email || '' }), t('auth.welcomeToastTitle'))
        navigate(params.get('returnTo') || '/dashboard', { replace: true })
      } else if (mode === 'register') {
        if (!password || password.length < 8) {
          setError('password', { message: 'auth.pwdMin' })
          return
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
          setError('password', { message: 'auth.pwdComplexity' })
          return
        }
        await authApi.register(email, password)
        toast.success(t('auth.registerToastBody'), t('auth.registerToastTitle'))
        setMode('login')
      } else {
        await authApi.forgotPassword(email)
        setForgotSuccess(true)
        toast.success(t('auth.forgotToastBody'), t('auth.forgotToastTitle'))
      }
    } catch (e) {
      if (e instanceof AppError && e.fieldErrors) {
        for (const [k, v] of Object.entries(e.fieldErrors)) setError(k as keyof Values, { message: v })
      } else {
        const msg = e instanceof AppError ? e.message : t('auth.genericError')
        // Show a "resend verification" helper when the server blocks login for unverified email
        if (msg.toLowerCase().includes('verify your email')) {
          setShowResendVerification(true)
          setResendEmail(email)
        }
        setFormError(msg)
        toast.error(msg, t('auth.errorToastTitle'))
      }
    }
  })

  const handleResend = async () => {
    try {
      await authApi.resendVerification(resendEmail)
      toast.success('E-mail de vérification renvoyé. Vérifiez votre boîte de réception.')
      setShowResendVerification(false)
    } catch {
      toast.error("Impossible de renvoyer l'e-mail. Réessayez dans quelques instants.")
    }
  }

  return (
    <div className="w-full border border-line bg-surface p-8 shadow-overlay sm:p-10">
      <div className="text-center">
        <img src="/brand/ztf-logo.png" alt={t('brand.name')} width={132} height={44} className="mx-auto h-11 w-auto object-contain" />
        <h1 className="mt-6 font-serif text-h1 text-ink">
          {mode === 'forgot'
            ? t('auth.forgotTitle')
            : t(mode === 'login' ? 'auth.loginTitle' : 'auth.registerTitle')}
        </h1>
        <p className="mt-2 font-sans text-sm text-ink-muted leading-relaxed">
          {mode === 'forgot'
            ? t('auth.forgotBody')
            : t(mode === 'login' ? 'auth.loginSubtitle' : 'auth.registerSubtitle')}
        </p>
      </div>

      {mode !== 'forgot' && (
        <>
          <a
            href="/oauth2/authorization/google"
            className="mt-8 flex min-h-touch w-full items-center justify-center gap-3 border border-line bg-paper font-sans text-sm font-semibold text-ink transition-colors duration-brand ease-brand hover:bg-line/40"
          >
            <GoogleIcon className="h-4 w-4" aria-hidden />
            {t('auth.google')}
          </a>

          <div className="my-6 flex items-center gap-3 text-ink-faint">
            <span className="h-px flex-1 bg-line" />
            <span className="font-sans text-sm">{t('auth.or')}</span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      {forgotSuccess ? (
        <div className="mt-8 border border-success/30 bg-success/10 p-4 text-success">
          <p className="font-semibold text-sm">{t('auth.emailSentTitle')}</p>
          <p className="font-sans text-xs mt-1">{t('auth.emailSentBody')}</p>
          <button
            onClick={() => setMode('login')}
            className="mt-4 inline-flex items-center font-sans text-xs font-semibold text-blue underline"
          >
            {t('auth.backToLogin')}
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className={mode === 'forgot' ? 'mt-8 flex flex-col gap-5' : 'flex flex-col gap-5'} noValidate>
          <Field name="email" label={t('auth.email')} error={errors.email && t(errors.email.message ?? '')}>
            <Input type="email" autoComplete="email" placeholder="name@example.com" {...register('email')} />
          </Field>

          {mode !== 'forgot' && (
            <Field
              name="password"
              label={t('auth.password')}
              hint={t('auth.pwdHint')}
              error={errors.password && t(errors.password.message ?? '')}
            >
              <Input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} {...register('password')} />
            </Field>
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" onClick={() => setMode('forgot')} className="font-sans text-xs font-semibold text-accent-ink hover:underline">
                {t('auth.forgotLink')}
              </button>
            </div>
          )}

          {formError && (
            <div>
              <p role="alert" className="font-sans text-sm text-danger">{formError}</p>
              {showResendVerification && (
                <button type="button" onClick={handleResend} className="mt-1 font-sans text-xs font-semibold text-accent-ink hover:underline">
                  Renvoyer l'e-mail de vérification
                </button>
              )}
            </div>
          )}

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full bg-blue text-paper hover:opacity-90">
            {mode === 'forgot'
              ? t('auth.sendResetLink')
              : t(mode === 'login' ? 'auth.login' : 'auth.register')}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center font-sans text-sm text-ink-muted">
        {mode === 'forgot' ? (
          <button onClick={() => setMode('login')} className="font-semibold text-blue hover:underline">
            {t('auth.backToLogin')}
          </button>
        ) : (
          <>
            {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <Link to={mode === 'login' ? '/auth/register' : '/auth/login'} className="font-semibold text-blue hover:underline">
              {t(mode === 'login' ? 'auth.toRegister' : 'auth.toLogin')}
            </Link>
          </>
        )}
      </p>
    </div>
  )
}

