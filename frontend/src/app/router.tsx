import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { NotFound } from './NotFound'
import { RequireAuth } from './guards'
import { OAuthTokenCapture } from './OAuthTokenCapture'
import { PublicLayout } from '@/shell/layouts/PublicLayout'
import { AppLayout } from '@/shell/layouts/AppLayout'
import { AuthLayout } from '@/shell/layouts/AuthLayout'
import { ImmersiveLayout } from '@/shell/layouts/ImmersiveLayout'
import { Skeleton } from '@/shared/ui'
import { setOnUnauthorized } from '@/shared/api/http'

// Chargement différé : l'espace admin ne pèse plus sur la première visite en 3G.
const HomePage = lazy(() => import('@/pages/home/HomePage').then((m) => ({ default: m.HomePage })))
const CataloguePage = lazy(() => import('@/pages/catalogue/CataloguePage').then((m) => ({ default: m.CataloguePage })))
const CourseDetailPage = lazy(() => import('@/pages/course/CourseDetailPage').then((m) => ({ default: m.CourseDetailPage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const StudentDashboard = lazy(() => import('@/pages/dashboard/StudentDashboard').then((m) => ({ default: m.StudentDashboard })))
const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const CoursePlayer = lazy(() => import('@/pages/learning/CoursePlayer').then((m) => ({ default: m.CoursePlayer })))
const ChatPage = lazy(() => import('@/pages/chat/ChatPage').then((m) => ({ default: m.ChatPage })))
const TeacherDashboard = lazy(() => import('@/pages/teacher/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard })))
const CourseEditor = lazy(() => import('@/pages/teacher/CourseEditor').then((m) => ({ default: m.CourseEditor })))
const CourseWizard = lazy(() => import('@/components/wizard/CourseWizard').then((m) => ({ default: m.CourseWizard })))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))

/** Redirige l'ancien chemin d'édition français en préservant l'identifiant du cours.
 *  TeacherDashboard et CourseWizard (hérités, réécrits au chantier 3) pointent encore
 *  vers /teacher/cours/:courseId. Sans cette redirection, créer ou éditer un cours mène à la 404. */
export function LegacyEditRedirect() {
  const { courseId } = useParams()
  return <Navigate to={`/teacher/courses/${courseId}/edit`} replace />
}

/** Squelette de route — jamais de spinner bloquant (CDC). */
function RouteFallback() {
  return (
    <div className="container space-y-4 py-10">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function AppRoutes() {
  const navigate = useNavigate()

  // Redirige sans rechargement complet quand la session expire.
  useEffect(() => {
    setOnUnauthorized(({ returnTo }) => {
      navigate(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`, { replace: true })
    })
  }, [navigate])

  return (
    <>
      <OAuthTokenCapture />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index path="/" element={<HomePage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/course/:slug" element={<CourseDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            {/* Anciens chemins français — conservés pour ne pas casser les liens */}
            <Route path="/auth/connexion" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/inscription" element={<Navigate to="/auth/register" replace />} />
          </Route>

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
            <Route path="/checkout/:courseId" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
            <Route path="/chat/:courseId" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route path="/teacher" element={<RequireAuth><TeacherDashboard /></RequireAuth>} />
            <Route path="/teacher/courses/new" element={<RequireAuth><CourseWizard /></RequireAuth>} />
            <Route path="/teacher/courses/:courseId/edit" element={<RequireAuth><CourseEditor /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
            {/* Anciens chemins de l'espace enseignant */}
            <Route path="/enseigner/cours/creer" element={<Navigate to="/teacher/courses/new" replace />} />
            <Route path="/teacher/cours/:courseId" element={<LegacyEditRedirect />} />
          </Route>

          <Route element={<ImmersiveLayout />}>
            <Route path="/learning/:courseId" element={<RequireAuth><CoursePlayer /></RequireAuth>} />
            <Route path="/learning/:courseId/:lessonId" element={<RequireAuth><CoursePlayer /></RequireAuth>} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
