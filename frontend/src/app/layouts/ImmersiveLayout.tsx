import { Link, Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Registre sombre. L'interface s'efface derrière le média — mais la sortie
 * reste visible en permanence.
 */
export function ImmersiveLayout() {
  const { t } = useTranslation()
  return (
    <div data-theme="dark" className="flex min-h-screen flex-col bg-scene text-scene-ink">
      <div className="flex min-h-touch items-center justify-between border-b border-line px-4">
        <Link to="/" className="font-serif text-body text-scene-ink">{t('brand.name')}</Link>
        <Link
          to="/my-courses"
          aria-label={t('nav.mobile.myCourses')}
          className="grid min-h-touch min-w-touch place-items-center"
        >
          <X className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <main id="contenu" className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
