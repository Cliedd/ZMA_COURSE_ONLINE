import { Link, Navigate } from 'react-router-dom'
import { BookOpen, Award, TrendingUp, ArrowRight, Play, CreditCard, MessageSquare, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { Separator } from '../../components/ui/separator'
import { useAuthStore } from '../../store/authStore'
import { useMyEnrollments, useMyCertificates } from '../../hooks/useEnrollment'
import { paymentApi } from '../../services/api'
import { useQuery } from '@tanstack/react-query'

const StatCard = ({ label, value, icon: Icon, sub }: any) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </CardContent>
  </Card>
)

// Generate a printable HTML certificate in a new tab
function downloadCertificate(certNumber: string, courseTitle: string, email: string) {
  const date = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Certificate ${certNumber}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;500;600&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#f8f7f4; display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .cert { width:800px; background:white; border:2px solid #1a4a9e; border-radius:16px; padding:60px 80px; text-align:center; box-shadow:0 8px 40px rgba(0,0,0,0.12); }
  .logo { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#1a4a9e; letter-spacing:-0.5px; }
  .logo span { color:#c97c1a; }
  .academy { font-size:10px; text-transform:uppercase; letter-spacing:0.3em; color:#888; margin-top:2px; }
  .divider { width:80px; height:3px; background:linear-gradient(90deg,#1a4a9e,#c97c1a); margin:24px auto; border-radius:2px; }
  .headline { font-size:13px; text-transform:uppercase; letter-spacing:0.2em; color:#888; margin-bottom:16px; }
  .title { font-family:'Playfair Display',serif; font-size:38px; font-weight:700; color:#1a1a1a; margin-bottom:24px; }
  .text { font-size:16px; color:#444; line-height:1.7; }
  .name { font-size:28px; font-weight:600; color:#1a4a9e; font-family:'Playfair Display',serif; margin:12px 0; }
  .course { font-size:22px; font-weight:700; color:#1a1a1a; margin:12px 0; font-family:'Playfair Display',serif; }
  .cert-num { display:inline-block; background:#f0f4ff; border:1px solid #c8d8ff; border-radius:8px; padding:8px 20px; font-size:13px; color:#1a4a9e; font-family:monospace; margin-top:20px; }
  .date { font-size:13px; color:#888; margin-top:12px; }
  .seal { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,#1a4a9e,#c97c1a); display:flex; align-items:center; justify-content:center; margin:28px auto 0; }
  .seal-text { color:white; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; text-align:center; }
  @media print { body { background:white; } }
</style>
</head>
<body>
<div class="cert">
  <div class="logo">ZTF <span>Music</span></div>
  <div class="academy">Academy</div>
  <div class="divider"></div>
  <div class="headline">Certificate of Completion</div>
  <div class="title">Congratulations!</div>
  <p class="text">This certificate is awarded to</p>
  <div class="name">${email}</div>
  <p class="text">for successfully completing the course</p>
  <div class="course">${courseTitle}</div>
  <div class="cert-num">${certNumber}</div>
  <div class="date">Issued on ${date}</div>
  <div class="seal"><div class="seal-text">ZTF<br/>Academy</div></div>
</div>
<script>window.onload=()=>window.print()</script>
</body>
</html>`
  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close() }
}

const GRADIENTS = [
  'from-blue-700 to-blue-900', 'from-amber-600 to-orange-800', 'from-emerald-600 to-teal-800',
  'from-purple-600 to-violet-900', 'from-rose-600 to-pink-800', 'from-cyan-600 to-sky-800',
  'from-indigo-600 to-blue-900', 'from-yellow-500 to-amber-700', 'from-green-600 to-emerald-800',
  'from-red-600 to-rose-800',
]

export const StudentDashboard = () => {
  const { email, isAuthenticated, role } = useAuthStore()

  if (!isAuthenticated()) return <Navigate to="/auth/connexion" replace />
  if (role === 'TEACHER')   return <Navigate to="/teacher" replace />
  if (role === 'ADMIN')     return <Navigate to="/admin" replace />

  const { data: enrollments = [], isLoading } = useMyEnrollments()
  const { data: certificates = [] } = useMyCertificates()
  const { data: payments = [] } = useQuery({
    queryKey: ['payments', 'me'],
    queryFn: () => paymentApi.getMine(),
    enabled: !!email,
  })

  const inProgress = enrollments.filter(e => (e.progress ?? 0) < 100)
  const completed = enrollments.filter(e => (e.progress ?? 0) >= 100)
  const initials = email ? email.slice(0, 2).toUpperCase() : 'ZM'
  const avgProgress = inProgress.length
    ? Math.round(inProgress.reduce((s, e) => s + (e.progress ?? 0), 0) / inProgress.length)
    : 0

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">My Student Space</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        <Link to="/catalogue">
          <Button variant="outline" size="sm" className="gap-2">
            Discover courses <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Enrolled Courses" value={isLoading ? '—' : enrollments.length} icon={BookOpen} sub="All statuses" />
        <StatCard label="In Progress" value={isLoading ? '—' : inProgress.length} icon={TrendingUp} sub={`Average progress: ${avgProgress}%`} />
        <StatCard label="Certificates" value={isLoading ? '—' : certificates.length} icon={Award} sub="Courses completed 100%" />
      </div>

      {/* In progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">My Courses</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : enrollments.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">You're not enrolled in any courses yet.</p>
              <Link to="/catalogue">
                <Button size="sm" variant="outline">Browse the catalog</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {enrollments.map((e, idx) => {
                const gradient = GRADIENTS[idx % GRADIENTS.length]
                const progress = e.progress ?? 0
                return (
                  <li key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shrink-0`}>
                      <Play className="h-4 w-4 text-white fill-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {e.courseTitle || `Course ${e.courseId.slice(0, 8)}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {e.courseLevel && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4">{e.courseLevel}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Progress value={progress} className="flex-1 h-1.5" />
                        <span className="text-xs text-muted-foreground shrink-0 w-9 text-right">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/chat/${e.courseId}`}>
                        <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link to={`/learning/${e.courseId}`}>
                        <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                          {progress > 0 ? 'Resume' : 'Start'} <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      {payments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment History
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {payments.map(p => (
                <li key={p.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Course payment</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{p.id.slice(0, 12).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{p.amount}€</p>
                    <Badge variant={p.status === 'SUCCESS' ? 'success' : 'muted'} className="text-[10px]">
                      {p.status === 'SUCCESS' ? 'Paid' : p.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-secondary" /> My Certificates
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {certificates.map(c => {
                const enrollment = enrollments.find(e => e.courseId === c.courseId)
                const courseTitle = enrollment?.courseTitle ?? `Course ${c.courseId.slice(0, 8)}`
                return (
                  <li key={c.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 shrink-0">
                      <Award className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{courseTitle}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{c.certNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="shrink-0">Earned</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs h-7 shrink-0"
                        onClick={() => downloadCertificate(c.certNumber, courseTitle, email ?? '')}
                      >
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-500" /> Completed Courses
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {completed.map((e, idx) => {
                const gradient = GRADIENTS[(idx + 5) % GRADIENTS.length]
                return (
                  <li key={e.id} className="flex items-center gap-4 px-6 py-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shrink-0`}>
                      <Award className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{e.courseTitle || `Course ${e.courseId.slice(0, 8)}`}</p>
                      {e.courseLevel && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 mt-0.5">{e.courseLevel}</Badge>
                      )}
                    </div>
                    <Badge variant="success">100%</Badge>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
