import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { HomePage } from './pages/home/HomePage';
import { CataloguePage } from './pages/catalogue/CataloguePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CourseDetailPage } from './pages/course/CourseDetailPage';
import { CourseWizard } from './components/wizard/CourseWizard';
import { StudentDashboard } from './pages/dashboard/StudentDashboard';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { CourseEditor } from './pages/teacher/CourseEditor';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { CoursePlayer } from './pages/learning/CoursePlayer';
import { ChatPage } from './pages/chat/ChatPage';
import { useAuthStore } from './store/authStore';

// ── Error Boundary ────────────────────────────────────────────────────────────
interface EBState { hasError: boolean; message: string }
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { hasError: false, message: '' };
  static getDerivedStateFromError(e: Error): EBState {
    return { hasError: true, message: e?.message ?? String(e) };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
          <p className="text-muted-foreground text-sm max-w-md">{this.state.message}</p>
          <button
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
            onClick={() => { this.setState({ hasError: false, message: '' }); window.location.href = '/'; }}
          >
            Back to home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/auth/connexion" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="catalogue" element={<CataloguePage />} />
            <Route path="course/:slug" element={<CourseDetailPage />} />
            <Route path="auth/connexion" element={<LoginPage />} />
            <Route path="auth/inscription" element={<RegisterPage />} />

            <Route path="dashboard" element={<RequireAuth><StudentDashboard /></RequireAuth>} />
            <Route path="checkout/:courseId" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
            <Route path="learning/:courseId" element={<RequireAuth><CoursePlayer /></RequireAuth>} />
            <Route path="chat/:courseId" element={<RequireAuth><ChatPage /></RequireAuth>} />

            <Route path="teacher" element={<RequireAuth><TeacherDashboard /></RequireAuth>} />
            <Route path="teacher/cours/:courseId" element={<RequireAuth><CourseEditor /></RequireAuth>} />
            <Route path="enseigner/cours/creer" element={<RequireAuth><CourseWizard /></RequireAuth>} />

            <Route path="admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
