import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/** Aucune navigation : on ne détourne pas quelqu'un en train de s'inscrire. */
export function AuthLayout() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <div className="container py-5">
        <Link to="/" className="font-serif text-h3 text-ink">{t('brand.name')}</Link>
      </div>
      <main id="contenu" className="container flex flex-1 items-start justify-center py-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
