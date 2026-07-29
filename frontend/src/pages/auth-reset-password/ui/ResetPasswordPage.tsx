import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Field, Input, Button, toast } from '@/shared/ui'
import { authApi } from '@/entities/session'
import { AppError } from '@/shared/api/http'

const schema = z.object({
  password: z.string().min(8, 'resetPassword.pwdMin'),
  confirmPassword: z.string().min(8, 'resetPassword.confirmRequired'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'resetPassword.pwdMismatch',
  path: ['confirmPassword'],
})

type Values = z.infer<typeof schema>

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!token) {
      setFormError(t('resetPassword.missingToken'))
      return
    }
    setFormError(null)
    try {
      await authApi.resetPassword(token, password)
      toast.success(t('resetPassword.successToastBody'), t('resetPassword.successToastTitle'))
      navigate('/auth/login', { replace: true })
    } catch (e) {
      const msg = e instanceof AppError ? e.message : t('resetPassword.genericError')
      setFormError(msg)
      toast.error(msg, t('resetPassword.errorToastTitle'))
    }
  })

  return (
    <div className="w-full max-w-md rounded-xl border border-line bg-paper p-8 shadow-sm">
      <h1 className="font-serif text-h2 text-ink">{t('resetPassword.title')}</h1>
      <p className="mt-2 font-sans text-sm text-ink-muted leading-relaxed">
        {t('resetPassword.subtitle')}
      </p>

      {!token ? (
        <div className="mt-6 rounded-lg bg-danger/10 border border-danger/30 p-4 text-danger">
          <p className="font-semibold text-sm">{t('resetPassword.invalidTitle')}</p>
          <p className="font-sans text-xs mt-1">
            {t('resetPassword.invalidBody')}
          </p>
          <Link to="/auth/login" className="mt-4 inline-flex font-sans text-xs font-semibold text-blue underline">
            {t('resetPassword.requestNewLink')}
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5" noValidate>
          <Field
            name="password"
            label={t('resetPassword.newPassword')}
            hint={t('resetPassword.pwdHint')}
            error={errors.password && t(errors.password.message ?? '')}
          >
            <Input type="password" autoComplete="new-password" {...register('password')} />
          </Field>

          <Field
            name="confirmPassword"
            label={t('resetPassword.confirmPassword')}
            error={errors.confirmPassword && t(errors.confirmPassword.message ?? '')}
          >
            <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
          </Field>

          {formError && <p role="alert" className="font-sans text-sm text-danger">{formError}</p>}

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            {t('resetPassword.submit')}
          </Button>
        </form>
      )}
    </div>
  )
}
