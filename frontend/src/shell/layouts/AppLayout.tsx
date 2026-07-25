import { Outlet } from 'react-router-dom'
import { Header } from '../Header'

/** Dense, sans pied de page marketing : on ne vend rien à quelqu'un déjà inscrit. */
export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main id="contenu" className="container flex-1 py-8">
        <Outlet />
      </main>
    </div>
  )
}
