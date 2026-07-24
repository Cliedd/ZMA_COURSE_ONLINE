import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Plus, Users, Star, ArrowRight, BookOpen, MessageSquare, TrendingUp, Eye, Loader2, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { useAuthStore } from '../../store/authStore'
import { useTeacherCourses } from '../../hooks/useCourses'
import { useEnrollmentsByCourse } from '../../hooks/useEnrollment'
import { useCreateOrGetRoom } from '../../hooks/useChat'

const STATUS_LABEL: Record<string, { label: string; variant: 'muted' | 'secondary' | 'destructive' | 'success' }> = {
  DRAFT:            { label: 'Draft',           variant: 'muted' },
  SUBMITTED:        { label: 'Submitted',       variant: 'secondary' },
  IN_REVIEW:        { label: 'In Review',       variant: 'secondary' },
  REVISION_NEEDED:  { label: 'Needs Revision',  variant: 'destructive' },
  PUBLISHED:        { label: 'Published',       variant: 'success' },
  ARCHIVED:         { label: 'Archived',        variant: 'muted' },
}

const GRADIENTS = [
  'from-blue-700 to-blue-900', 'from-amber-600 to-orange-800', 'from-emerald-600 to-teal-800',
  'from-purple-600 to-violet-900', 'from-rose-600 to-pink-800', 'from-cyan-600 to-sky-800',
  'from-indigo-600 to-blue-900', 'from-yellow-500 to-amber-700', 'from-green-600 to-emerald-800',
  'from-red-600 to-rose-800',
]

const CourseRow = ({ course, idx, email }: { course: any; idx: number; email: string }) => {
  const gradient = GRADIENTS[idx % GRADIENTS.length]
  const { data: enrollments = [] } = useEnrollmentsByCourse(course.id)
  const createRoom = useCreateOrGetRoom()
  const navigate = useNavigate()

  const handleOpenChat = async () => {
    await createRoom.mutateAsync({
      courseId: course.id,
      courseName: course.title,
      createdByEmail: email,
    })
    navigate(`/chat/${course.id}`)
  }

  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shrink-0`}>
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm">{course.title}</p>
            <p className="text-xs text-muted-foreground">{course.filiere}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <Badge variant="outline" className="text-[10px]">{course.level}</Badge>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <Users className="h-3.5 w-3.5" /> {enrollments.length}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" /> {course.rating?.toFixed(1) ?? '—'}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="font-semibold text-sm">{course.price}€</span>
      </td>
      <td className="px-4 py-4">
        <Badge variant={STATUS_LABEL[course.status]?.variant ?? 'muted'}>
          {STATUS_LABEL[course.status]?.label ?? course.status}
        </Badge>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center gap-1 justify-end">
          <Link to={`/teacher/cours/${course.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7 px-2.5">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={handleOpenChat}
            disabled={createRoom.isPending}
          >
            {createRoom.isPending
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <MessageSquare className="h-3.5 w-3.5" />
            }
            Chat
          </Button>
          <Link to={`/course/${course.slug ?? course.id}`}>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  )
}

export const TeacherDashboard = () => {
  const { email, isAuthenticated, role } = useAuthStore()

  if (!isAuthenticated()) return <Navigate to="/auth/connexion" replace />
  if (role !== 'TEACHER')  return <Navigate to="/dashboard" replace />

  const { data: courses = [], isLoading } = useTeacherCourses(email ?? '')

  const avgRating = courses.length
    ? (courses.reduce((acc: number, c: any) => acc + (c.rating ?? 0), 0) / courses.length).toFixed(1)
    : '—'

  const initials = email ? email.slice(0, 2).toUpperCase() : 'ZM'

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarFallback className="text-sm font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{email}</p>
          </div>
        </div>
        <Link to="/enseigner/cours/creer">
          <Button className="gap-2 shadow-sm shadow-primary/20">
            <Plus className="h-4 w-4" /> New course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">My Courses</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-900/30">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{isLoading ? '—' : courses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Average Rating</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-600 bg-amber-50 dark:bg-amber-900/30">
                <Star className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{avgRating}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Revenue</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">—</p>
            <p className="text-xs text-muted-foreground mt-1">Analytics module coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* My courses table */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">My Published Courses</CardTitle>
          <Link to="/catalogue">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">You haven't created any courses yet.</p>
              <Link to="/enseigner/cours/creer">
                <Button size="sm">Create my first course</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Course</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Level</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Enrolled</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rating</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courses.map((course: any, idx: number) => (
                    <CourseRow key={course.id} course={course} idx={idx} email={email ?? ''} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 shrink-0">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Chat with your students</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click the "Chat" button on a course to open the discussion room with all students enrolled in that course.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
