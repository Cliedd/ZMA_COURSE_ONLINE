import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { Header } from './Header'
import { useAuthStore } from '../../store/authStore'
import { Music, Instagram, Youtube, Twitter, Mail, MapPin, Phone, ArrowRight } from 'lucide-react'
import { IMG } from '../../lib/images'

const FOOTER_LINKS = {
  'Formations': [
    { label: 'Licences',    to: '/catalogue?level=Licence' },
    { label: 'Masters',     to: '/catalogue?level=Master' },
    { label: 'Doctorats',   to: '/catalogue?level=Doctorat' },
    { label: 'Certificats', to: '/catalogue?level=Certificat' },
  ],
  'Académie': [
    { label: 'À propos',       to: '/' },
    { label: 'Nos enseignants', to: '/' },
    { label: 'Partenariats',   to: '/' },
    { label: 'Presse',         to: '/' },
  ],
  'Étudiant': [
    { label: 'Mon espace',   to: '/dashboard' },
    { label: 'Catalogue',    to: '/catalogue' },
    { label: 'Certification', to: '/dashboard' },
    { label: 'Support',       to: '/' },
  ],
}

export const RootLayout = () => {
  const { setToken } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    if (token) {
      setToken(token)
      navigate('/dashboard', { replace: true })
    }
  }, [location.search])

  const isFullscreen = location.pathname.startsWith('/learning') || location.pathname.startsWith('/chat')

  if (isFullscreen) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="relative overflow-hidden bg-[#06111f] text-white mt-16">
        {/* Background image */}
        <div className="absolute inset-0 opacity-10">
          <img src={IMG.jazz} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#06111f]/80" />
        </div>

        <div className="relative">
          {/* Top band */}
          <div className="border-b border-white/10">
            <div className="container py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

                {/* Brand */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero shadow-lg shadow-primary/30">
                      <Music className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-black tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                        ZTF Music Académie
                      </p>
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Excellence · Afrique</p>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                    Former les musiciens africains aux standards internationaux, tout en préservant et valorisant l'identité musicale africaine.
                  </p>
                  {/* Social */}
                  <div className="flex items-center gap-3">
                    {[
                      { icon: Instagram, href: '#' },
                      { icon: Youtube,   href: '#' },
                      { icon: Twitter,   href: '#' },
                    ].map(({ icon: Icon, href }) => (
                      <a key={href} href={href} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-amber-400 hover:text-amber-900 text-white/60 transition-all duration-300">
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                  {/* Newsletter */}
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Votre email…"
                      className="flex-1 bg-white/10 border border-white/15 text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-400/50"
                    />
                    <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-amber-900 hover:bg-amber-300 transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/30">Recevez nos actualités et nouvelles formations.</p>
                </div>

                {/* Links */}
                {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                  <div key={title} className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">{title}</h4>
                    <ul className="space-y-2.5">
                      {links.map(({ label, to }) => (
                        <li key={label}>
                          <Link to={to} className="text-white/50 hover:text-white text-sm transition-colors hover:translate-x-1 inline-block duration-200">
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact strip */}
          <div className="border-b border-white/10">
            <div className="container py-5">
              <div className="flex flex-wrap gap-6 items-center justify-center md:justify-start text-white/40 text-xs">
                <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-amber-400/70" /> Afrique Centrale</span>
                <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-amber-400/70" /> contact@ztfmusic.com</span>
                <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-amber-400/70" /> +237 XXX XXX XXX</span>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="container py-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30">
              <p>© 2025 ZTF Music Académie — Tous droits réservés</p>
              <div className="flex gap-5">
                {['Mentions légales', 'Confidentialité', 'CGV', 'Cookies'].map(t => (
                  <span key={t} className="hover:text-white/70 cursor-pointer transition-colors">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
