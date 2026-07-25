import { useParams, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, Star, Play, ShoppingCart, BookOpen, Award, Loader2, ArrowLeft, GraduationCap, FileText, MessageSquare } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Card, CardContent } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import { useCourseBySlug } from '../../hooks/useCourses'
import { useIsEnrolled } from '../../hooks/useEnrollment'
import { useAuthStore } from '@/entities/session'
import type { CurriculumSection } from '../../types'

const GRADIENTS = [
  'from-blue-700 to-blue-900',
  'from-amber-600 to-orange-800',
  'from-emerald-600 to-teal-800',
  'from-purple-600 to-violet-900',
  'from-rose-600 to-pink-800',
  'from-cyan-600 to-sky-800',
  'from-indigo-600 to-blue-900',
  'from-yellow-500 to-amber-700',
  'from-green-600 to-emerald-800',
  'from-red-600 to-rose-800',
]

const LEVEL_COLOR: Record<string, string> = {
  Licence:   'bg-blue-500/20 text-blue-200 border-blue-400/30',
  Master:    'bg-purple-500/20 text-purple-200 border-purple-400/30',
  Doctorat:  'bg-rose-500/20 text-rose-200 border-rose-400/30',
  Certificat:'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  Atelier:   'bg-amber-500/20 text-amber-200 border-amber-400/30',
}

export const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { data: course, isLoading, isError } = useCourseBySlug(slug ?? '')
  const { data: enrollCheck } = useIsEnrolled(course?.id ?? '')

  const isEnrolled = enrollCheck?.enrolled ?? false

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
        <h2 className="text-2xl font-bold">Cours introuvable</h2>
        <p className="text-muted-foreground">Ce cours n'existe pas ou a été supprimé.</p>
        <Link to="/catalogue"><Button>Retour au catalogue</Button></Link>
      </div>
    )
  }

  const gradient = GRADIENTS[(course.gradientIndex ?? 0) % GRADIENTS.length]
  const levelClass = LEVEL_COLOR[course.level ?? ''] ?? 'bg-white/15 text-white border-white/20'

  let curriculum: CurriculumSection[] = []
  try { curriculum = JSON.parse(course.curriculumJson ?? '[]') } catch { /* ignore */ }

  let skills: string[] = []
  try { skills = JSON.parse(course.skillsJson ?? '[]') } catch { /* ignore */ }

  const debouches = (course.debouches ?? '').split('|').filter(Boolean)
  const totalLessons = curriculum.reduce((acc, s) => acc + (s.lessons?.length ?? 0), 0)

  const handleCTA = () => {
    if (isEnrolled) {
      navigate(`/learning/${course.id}`)
    } else if (!isAuthenticated()) {
      navigate('/auth/connexion')
    } else {
      navigate(`/checkout/${course.id}`)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Back */}
      <Link to="/catalogue" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour au catalogue
      </Link>

      {/* ── Hero banner ── */}
      <div className={`relative rounded-2xl bg-gradient-to-br ${gradient} overflow-hidden px-8 py-10 text-white`}>
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -left-8 bottom-0 h-48 w-48 rounded-full bg-black/10 blur-2xl" />
        <div className="relative max-w-2xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`border text-xs font-semibold ${levelClass}`}>{course.level}</Badge>
            {course.ects && (
              <Badge className="bg-white/15 text-white border-white/20 text-xs">{course.ects} ECTS</Badge>
            )}
            {course.rating >= 4.9 && (
              <Badge className="bg-amber-400 text-amber-900 border-0 text-xs font-bold">Bestseller</Badge>
            )}
            {isEnrolled && (
              <Badge className="bg-emerald-500 text-white border-0 text-xs font-bold">Inscrit</Badge>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{course.title}</h1>
          <p className="text-white/75 text-sm leading-relaxed line-clamp-3">
            {course.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <strong className="text-white">{(course.rating ?? 4.8).toFixed(1)}</strong>
              <span className="text-white/50">({(course.studentsCount ?? 0).toLocaleString()} inscrits)</span>
            </span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.durationHours}h de contenu</span>
            <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {totalLessons} leçons</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-white/20 text-white">
                {course.teacherName?.split(' ').map(n => n[0]).join('') ?? 'ZMA'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/70">{course.teacherName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Skills */}
          {skills.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Ce que vous apprendrez</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {skills.map((skill, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">{skill}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Curriculum */}
          {curriculum.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Programme du cours</h2>
                <span className="text-xs text-muted-foreground">{curriculum.length} semestres · {totalLessons} modules</span>
              </div>
              <Accordion type="single" collapsible defaultValue={curriculum[0]?.id}>
                {curriculum.map((sem, idx) => (
                  <AccordionItem key={sem.id} value={sem.id} className="rounded-lg border mb-2 px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {idx + 1}
                        </div>
                        <span className="font-medium text-sm text-left">{sem.title}</span>
                        <Badge variant="outline" className="text-[10px] ml-auto mr-2">
                          {sem.lessons?.length ?? 0} modules
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 pb-2">
                        {(sem.lessons ?? []).map((lesson, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <Play className="h-3 w-3 text-primary fill-primary mt-0.5 shrink-0" />
                            {typeof lesson === 'string' ? lesson : lesson.title}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Débouchés */}
          {debouches.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Débouchés professionnels
                </h2>
                <div className="flex flex-wrap gap-2">
                  {debouches.map((d, i) => (
                    <Badge key={i} variant="secondary" className="text-xs py-1 px-3">{d}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat access if enrolled */}
          {isEnrolled && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Chat du cours</p>
                  <p className="text-xs text-muted-foreground">Discutez avec votre enseignant et vos camarades</p>
                </div>
                <Link to={`/chat/${course.id}`}>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" /> Ouvrir le chat
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Filière info */}
          <Card className="bg-muted/30">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Département · Filière</p>
                <p className="font-semibold text-sm">{course.department}</p>
                <p className="text-sm text-muted-foreground">{course.filiere}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-xl border-0 ring-1 ring-border overflow-hidden">
            {/* Price header */}
            <div className={`bg-gradient-to-br ${gradient} p-5`}>
              <div className="text-white">
                {isEnrolled ? (
                  <span className="text-2xl font-bold">Vous êtes inscrit</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold">{course.price}€</span>
                    {(course.level === 'Licence' || course.level === 'Master') ? (
                      <span className="ml-2 text-white/60 text-sm line-through">{Math.round(course.price * 1.4)}€</span>
                    ) : null}
                  </>
                )}
              </div>
              {course.ects && (
                <p className="text-white/70 text-xs mt-1">{course.ects} ECTS · Accès à vie</p>
              )}
            </div>

            <CardContent className="p-5 space-y-4">
              <Button
                size="lg"
                className="w-full gap-2 shadow-md shadow-primary/20 font-semibold"
                onClick={handleCTA}
              >
                {isEnrolled ? (
                  <><Play className="h-4 w-4 fill-current" /> Continuer l'apprentissage</>
                ) : (
                  <><ShoppingCart className="h-4 w-4" /> S'inscrire maintenant</>
                )}
              </Button>
              {!isEnrolled && (
                <Button size="lg" variant="outline" className="w-full gap-2">
                  <Play className="h-4 w-4 fill-current" /> Voir la présentation
                </Button>
              )}
              {isEnrolled && (
                <Link to={`/chat/${course.id}`} className="block">
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <MessageSquare className="h-4 w-4" /> Accéder au chat
                  </Button>
                </Link>
              )}

              <Separator />

              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  ['Niveau', course.level],
                  ['Durée', `${course.durationHours}h de contenu`],
                  ['Modules', `${totalLessons} modules`],
                  ['Accès', 'À vie · Toutes plateformes'],
                  ['Certificat', 'Certificat officiel ZMA'],
                ].map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-2">
                    <span className="font-medium text-foreground">{k}</span>
                    <span className="text-right">{v}</span>
                  </li>
                ))}
              </ul>

              {!isEnrolled && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <Award className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-center text-xs text-muted-foreground">
                    Garantie satisfait ou remboursé 30 jours
                  </p>
                </div>
              )}

              <Separator />

              {/* Teacher */}
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                    {course.teacherName?.split(' ').map(n => n[0]).join('') ?? 'ZMA'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Enseignant</p>
                  <p className="text-sm font-medium">{course.teacherName}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(course.rating ?? 5) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {(course.rating ?? 4.8).toFixed(1)} · {(course.studentsCount ?? 0).toLocaleString()} étudiants
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
