import { Outlet } from 'react-router-dom'
import { Header } from '@/widgets/header'
import { Footer } from '@/widgets/footer'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main id="contenu" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
