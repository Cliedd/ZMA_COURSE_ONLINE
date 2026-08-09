import { Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { NotFound } from './NotFound'
import { RequireAuth, RequireRole } from './guards'
import { OAuthCallbackPage } from './OAuthCallbackPage'
import { lazyWithReload } from './lazyWithReload'
import { PublicLayout } from '@/app/layouts/PublicLayout'
import { AppLayout } from '@/app/layouts/AppLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { ImmersiveLayout } from '@/app/layouts/ImmersiveLayout'
import { Skeleton } from '@/shared/ui'
import { setOnUnauthorized } from '@/shared/api/http'

// Chargement différé : l'espace admin ne pèse plus sur la première visite en 3G.
// lazyWithReload (et non lazy() nu) : si le chunk a été supprimé du serveur par un
// déploiement pendant que l'onglet était ouvert, on recharge la page une fois au lieu
// d'afficher l'écran d'erreur générique (« Failed to fetch dynamically imported module »).
const HomePage = lazyWithReload(() => import('@/pages/home').then((m) => ({ default: m.HomePage })))
const CataloguePage = lazyWithReload(() => import('@/pages/catalogue').then((m) => ({ default: m.CataloguePage })))
const CourseDetailPage = lazyWithReload(() => import('@/pages/course-detail').then((m) => ({ default: m.CourseDetailPage })))
const TeachersPage = lazyWithReload(() => import('@/pages/teachers').then((m) => ({ default: m.TeachersPage })))
const TeacherProfilePage = lazyWithReload(() => import('@/pages/teacher-profile').then((m) => ({ default: m.TeacherProfilePage })))
const LoginPage = lazyWithReload(() => import('@/pages/auth-login').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazyWithReload(() => import('@/pages/auth-register').then((m) => ({ default: m.RegisterPage })))
const ResetPasswordPage = lazyWithReload(() => import('@/pages/auth-reset-password').then((m) => ({ default: m.ResetPasswordPage })))

const StudentDashboard = lazyWithReload(() => import('@/pages/dashboard').then((m) => ({ default: m.StudentDashboard })))
const MyCoursesPage = lazyWithReload(() => import('@/pages/my-courses').then((m) => ({ default: m.MyCoursesPage })))
const CertificatesPage = lazyWithReload(() => import('@/pages/certificates').then((m) => ({ default: m.CertificatesPage })))
const SettingsPage = lazyWithReload(() => import('@/pages/settings').then((m) => ({ default: m.SettingsPage })))
const CheckoutPage = lazyWithReload(() => import('@/pages/checkout').then((m) => ({ default: m.CheckoutPage })))
const CheckoutReturnPage = lazyWithReload(() => import('@/pages/checkout-return').then((m) => ({ default: m.CheckoutReturnPage })))
const CoursePlayer = lazyWithReload(() => import('@/pages/learning').then((m) => ({ default: m.CoursePlayer })))
const ChatPage = lazyWithReload(() => import('@/pages/chat/ChatPage').then((m) => ({ default: m.ChatPage })))
const TeacherDashboardPage = lazyWithReload(() => import('@/pages/teacher-dashboard').then((m) => ({ default: m.TeacherDashboardPage })))
const CourseEditorPage = lazyWithReload(() => import('@/pages/teacher-course-edit').then((m) => ({ default: m.CourseEditorPage })))
const CourseWizardPage = lazyWithReload(() => import('@/pages/teacher-course-new').then((m) => ({ default: m.CourseWizardPage })))
const AdminOverviewPage = lazyWithReload(() => import('@/pages/admin-overview').then((m) => ({ default: m.AdminOverviewPage })))
const AdminUsersPage = lazyWithReload(() => import('@/pages/admin-users').then((m) => ({ default: m.AdminUsersPage })))
const AdminFinancePage = lazyWithReload(() => import('@/pages/admin-finance').then((m) => ({ default: m.AdminFinancePage })))
const CertificateVerifyPage = lazyWithReload(() => import('@/pages/certificate-verify').then((m) => ({ default: m.CertificateVerifyPage })))

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
    <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index path="/" element={<HomePage />} />
            <Route path="/catalogue" element={<CataloguePage />} />
            <Route path="/course/:slug" element={<CourseDetailPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/teachers/:username" element={<TeacherProfilePage />} />
            <Route path="/certificates/verify" element={<CertificateVerifyPage />} />
            <Route path="/certificates/verify/:certNumber" element={<CertificateVerifyPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />
            {/* Anciens chemins français — conservés pour ne pas casser les liens */}
            <Route path="/auth/connexion" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/inscription" element={<Navigate to="/auth/register" replace />} />
          </Route>

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
            <Route path="/my-courses" element={<RequireAuth><MyCoursesPage /></RequireAuth>} />
            <Route path="/certificates" element={<RequireAuth><CertificatesPage /></RequireAuth>} />
            <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
            <Route path="/checkout/:courseId" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
            <Route path="/checkout/return" element={<RequireAuth><CheckoutReturnPage /></RequireAuth>} />
            <Route path="/chat/:courseId" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route path="/teacher" element={<RequireRole role="TEACHER"><TeacherDashboardPage /></RequireRole>} />
            <Route path="/teacher/courses/new" element={<RequireRole role="TEACHER"><CourseWizardPage /></RequireRole>} />
            <Route path="/teacher/courses/:courseId/edit" element={<RequireRole role="TEACHER"><CourseEditorPage /></RequireRole>} />
            <Route path="/admin" element={<RequireAuth><AdminOverviewPage /></RequireAuth>} />
            <Route path="/admin/users" element={<RequireAuth><AdminUsersPage /></RequireAuth>} />
            <Route path="/admin/finance" element={<RequireAuth><AdminFinancePage /></RequireAuth>} />
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
  )
}
