import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Music, Chrome, Eye, EyeOff, Loader2, GraduationCap, BookOpen } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Separator } from '../../components/ui/separator'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'
import type { UserRole } from '../../types'

const ROLES: { value: UserRole; label: string; desc: string; icon: React.ElementType }[] = [
  {
    value: 'STUDENT',
    label: 'Étudiant',
    desc: 'Je souhaite apprendre et suivre des cours.',
    icon: GraduationCap,
  },
  {
    value: 'TEACHER',
    label: 'Enseignant',
    desc: 'Je souhaite créer et enseigner des cours.',
    icon: BookOpen,
  },
]

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState<UserRole>('STUDENT')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google'
  }

  const handleRegister = async () => {
    if (!email || !password || !confirm) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await register({ email, password, role })
      navigate('/dashboard')
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card shadow-sm p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero mb-4">
              <Music className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Rejoindre la ZMA</h1>
            <p className="text-sm text-muted-foreground">
              Créez votre compte et commencez votre parcours musical
            </p>
          </div>

          {/* Google */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full gap-3 h-11 font-medium"
          >
            <Chrome className="h-4 w-4 text-red-500" />
            Continuer avec Google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground font-medium">ou</span>
            <Separator className="flex-1" />
          </div>

          {/* Role selector */}
          <div className="space-y-2">
            <Label>Vous êtes...</Label>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all",
                    role === value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    role === value ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Icon className={cn("h-4 w-4", role === value ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <span className="font-semibold text-sm">{label}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8 caractères minimum"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Répétez votre mot de passe"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              className="w-full h-11 font-semibold"
              onClick={handleRegister}
              disabled={loading}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Création du compte...</>
                : 'Créer mon compte gratuitement'
              }
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            En créant un compte, vous acceptez les{' '}
            <span className="text-primary cursor-pointer hover:underline">conditions d'utilisation</span>
            {' '}et la{' '}
            <span className="text-primary cursor-pointer hover:underline">politique de confidentialité</span>.
          </p>

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link to="/auth/connexion" className="text-primary font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
