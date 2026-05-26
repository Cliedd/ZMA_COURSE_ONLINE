import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Users, BookOpen, Clock, TrendingUp, CheckCircle2, XCircle, ShieldCheck, Loader2, Eye, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Separator } from '../../components/ui/separator'
import { courseApi } from '../../services/api'
import type { Course } from '../../types'

export const AdminDashboard = () => {
  const queryClient = useQueryClient()
  const [actionLoading, setActionLoading] = useState<Record<string, 'publish' | 'delete' | null>>({})

  // Load all courses (published + unpublished) — admin endpoint
  const { data: allCourses = [], isLoading, error } = useQuery<Course[]>({
    queryKey: ['admin-courses'],
    queryFn: () => courseApi.getAllAdmin({ size: 500 }),
  })

  const publishedCourses = allCourses.filter(c => c.published)
  const pendingCourses = allCourses.filter(c => !c.published)

  const handlePublish = async (courseId: string, published: boolean) => {
    setActionLoading(prev => ({ ...prev, [courseId]: 'publish' }))
    try {
      await courseApi.publish(courseId, published)
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
    } finally {
      setActionLoading(prev => ({ ...prev, [courseId]: null }))
    }
  }

  const handleReject = async (courseId: string) => {
    if (!confirm('Supprimer ce cours ? Cette action est irréversible.')) return
    setActionLoading(prev => ({ ...prev, [courseId]: 'delete' }))
    try {
      await courseApi.delete(courseId)
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
    } finally {
      setActionLoading(prev => ({ ...prev, [courseId]: null }))
    }
  }

  const kpis = [
    {
      label: 'Cours publiés',
      value: isLoading ? '…' : String(publishedCourses.length),
      change: `${allCourses.length} cours au total`,
      icon: BookOpen,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'En attente',
      value: isLoading ? '…' : String(pendingCourses.length),
      change: 'Brouillons à valider',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Utilisateurs',
      value: '—',
      change: 'API non disponible',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Revenus',
      value: '—',
      change: 'API non disponible',
      icon: TrendingUp,
      color: 'text-violet-600 bg-violet-50',
    },
  ]

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Administration</h1>
            <p className="text-sm text-muted-foreground">Vue d'ensemble de la plateforme</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-courses'] })}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualiser
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(({ label, value, change, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Validation queue */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">File de validation des cours</CardTitle>
            <Badge variant="secondary" className="text-xs">{pendingCourses.length} en attente</Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-10 text-center text-sm text-destructive">
              Erreur lors du chargement des cours.
            </div>
          ) : pendingCourses.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              <p className="text-sm text-muted-foreground">Aucun cours en attente de validation.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cours</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Niveau</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Prix</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingCourses.map(course => {
                  const loading = actionLoading[course.id]
                  return (
                    <tr key={course.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{course.teacherName || course.teacherEmail || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {course.level
                          ? <Badge variant="outline" className="text-xs">{course.level}</Badge>
                          : <span className="text-xs text-muted-foreground">—</span>
                        }
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-xs text-muted-foreground">
                        {course.price === 0 ? 'Gratuit' : `${course.price} €`}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {course.slug && (
                            <Link to={`/course/${course.slug}`} target="_blank">
                              <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-7 text-muted-foreground">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            size="sm"
                            className="gap-1.5 text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handlePublish(course.id, true)}
                            disabled={!!loading}
                          >
                            {loading === 'publish'
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <CheckCircle2 className="h-3.5 w-3.5" />
                            }
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/5"
                            onClick={() => handleReject(course.id)}
                            disabled={!!loading}
                          >
                            {loading === 'delete'
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <XCircle className="h-3.5 w-3.5" />
                            }
                            Rejeter
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Published courses list */}
      {publishedCourses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Cours publiés</CardTitle>
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">{publishedCourses.length} publiés</Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cours</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Niveau</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Étudiants</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {publishedCourses.map(course => {
                  const loading = actionLoading[course.id]
                  return (
                    <tr key={course.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{course.teacherName || course.teacherEmail || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {course.level
                          ? <Badge variant="outline" className="text-xs">{course.level}</Badge>
                          : <span className="text-xs text-muted-foreground">—</span>
                        }
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell text-xs text-muted-foreground">
                        {course.studentsCount ?? 0} étudiant{(course.studentsCount ?? 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {course.slug && (
                            <Link to={`/course/${course.slug}`} target="_blank">
                              <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-7 text-muted-foreground">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs h-7 text-amber-600 border-amber-300 hover:bg-amber-50"
                            onClick={() => handlePublish(course.id, false)}
                            disabled={!!loading}
                          >
                            Dépublier
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
