import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Music, Chrome, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Separator } from '../../components/ui/separator'
import { useAuth } from '../../hooks/useAuth'

export const LoginPage = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google'
  }

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError(null)
    setLoading(true)
    try {
      await login({ email, password })
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Incorrect credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero mb-4">
              <Music className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Log in to continue your learning journey
            </p>
          </div>

          {/* Google */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full gap-3 h-11 font-medium"
          >
            <Chrome className="h-4.5 w-4.5 text-red-500" />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground font-medium">or</span>
            <Separator className="flex-1" />
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
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

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              className="w-full h-11 font-semibold"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Logging in...</> : 'Log in'}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account yet?{' '}
            <Link to="/auth/inscription" className="text-primary font-semibold hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
