import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Field, Input, Button, toast } from '@/shared/ui'
import { authApi } from '@/entities/session'
import { AppError } from '@/shared/api/http'

const schema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(8, 'Veuillez confirmer le mot de passe'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

type Values = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  })

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!token) {
      setFormError('Jeton de réinitialisation manquant ou invalide.')
      return
    }
    setFormError(null)
    try {
      await authApi.resetPassword(token, password)
      toast.success('Votre mot de passe a été réinitialisé avec succès ! Connectez-vous.', 'Réinitialisation réussie')
      navigate('/auth/login', { replace: true })
    } catch (e) {
      const msg = e instanceof AppError ? e.message : 'Erreur lors de la réinitialisation'
      setFormError(msg)
      toast.error(msg, 'Erreur')
    }
  })

  return (
    <div className="w-full max-w-md rounded-xl border border-line bg-paper p-8 shadow-sm">
      <h1 className="font-serif text-h2 text-ink">Réinitialisation du mot de passe</h1>
      <p className="mt-2 font-sans text-sm text-ink-muted leading-relaxed">
        Choisissez un nouveau mot de passe sécurisé pour votre compte ZMA Course Online.
      </p>

      {!token ? (
        <div className="mt-6 rounded-lg bg-danger/10 border border-danger/30 p-4 text-danger">
          <p className="font-semibold text-sm">Lien invalide ou expiré</p>
          <p className="font-sans text-xs mt-1">
            Le jeton de réinitialisation est absent de l'URL. Veuillez refaire une demande.
          </p>
          <Link to="/auth/login" className="mt-4 inline-flex font-sans text-xs font-semibold text-blue underline">
            Demander un nouveau lien
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5" noValidate>
          <Field name="password" label="Nouveau mot de passe" hint="Au moins 8 caractères" error={errors.password?.message}>
            <Input type="password" autoComplete="new-password" {...register('password')} />
          </Field>

          <Field name="confirmPassword" label="Confirmez le nouveau mot de passe" error={errors.confirmPassword?.message}>
            <Input type="password" autoComplete="new-password" {...register('confirmPassword')} />
          </Field>

          {formError && <p role="alert" className="font-sans text-sm text-danger">{formError}</p>}

          <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
            Mettre à jour le mot de passe
          </Button>
        </form>
      )}
    </div>
  )
}
