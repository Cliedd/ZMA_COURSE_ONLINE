import { useState, useEffect, useRef } from 'react'
import { Play, CheckCircle2, MessageSquare, FileText, StickyNote, BookOpen,
         ChevronLeft, Loader2, Lock, Volume2, VolumeX, Maximize, SkipForward } from 'lucide-react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Separator } from '../../components/ui/separator'
import { cn } from '../../lib/utils'
import { useCourse } from '../../hooks/useCourses'
import { useIsEnrolled } from '../../hooks/useEnrollment'
import { useAuthStore } from '@/entities/session'
import { enrollmentApi } from '../../services/api'
import type { CurriculumSection, CurriculumLesson } from '../../types'

// Normalize lesson from string | CurriculumLesson to CurriculumLesson
function normalizeLesson(lesson: string | CurriculumLesson): CurriculumLesson {
  return typeof lesson === 'string' ? { title: lesson } : lesson
}

export const CoursePlayer = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const videoRef = useRef<HTMLVideoElement>(null)

  const { data: course, isLoading: courseLoading } = useCourse(courseId ?? '')
  const { data: enrollCheck, isLoading: enrollLoading } = useIsEnrolled(courseId ?? '')

  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [muted, setMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Parse curriculum — handles both old string[] and new {title,mediaId?}[] formats
  let curriculum: CurriculumSection[] = []
  try { curriculum = JSON.parse(course?.curriculumJson ?? '[]') } catch { /* ignore */ }

  // Flatten all lessons with normalized structure
  const allLessons: { id: string; sectionTitle: string; title: string; mediaId?: string }[] = []
  curriculum.forEach((section, si) => {
    (section.lessons ?? []).forEach((rawLesson, li) => {
      const lesson = normalizeLesson(rawLesson)
      allLessons.push({
        id: `${si}-${li}`,
        sectionTitle: section.title,
        title: lesson.title,
        mediaId: lesson.mediaId,
      })
    })
  })

  useEffect(() => {
    if (allLessons.length > 0 && !activeLesson) {
      setActiveLesson(allLessons[0]!.id)
    }
  }, [allLessons.length])

  // Load completed lessons from enrollment
  useEffect(() => {
    if (enrollCheck?.enrollmentId) {
      enrollmentApi.getMine().then(enrollments => {
        const enrollment = enrollments.find(e => e.id === enrollCheck.enrollmentId)
        if (enrollment?.completedLessonsJson) {
          try {
            setCompletedLessons(JSON.parse(enrollment.completedLessonsJson))
          } catch { /* ignore */ }
        }
      }).catch(() => {})
    }
  }, [enrollCheck?.enrollmentId])

  const markLessonComplete = async (lessonId: string) => {
    if (completedLessons.includes(lessonId)) return
    const updated = [...completedLessons, lessonId]
    setCompletedLessons(updated)

    if (enrollCheck?.enrollmentId) {
      try {
        await enrollmentApi.updateLessons(enrollCheck.enrollmentId, JSON.stringify(updated))
        const totalProgress = Math.round((updated.length / allLessons.length) * 100)
        await enrollmentApi.updateProgress(enrollCheck.enrollmentId, totalProgress)
      } catch { /* ignore */ }
    }
  }

  if (!isAuthenticated()) {
    navigate('/auth/connexion')
    return null
  }

  if (courseLoading || enrollLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!enrollCheck?.enrolled) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Accès restreint</h2>
          <p className="text-muted-foreground mt-2">Vous devez vous inscrire à ce cours pour accéder au contenu.</p>
        </div>
        {course && (
          <Link to={`/checkout/${course.id}`}>
            <Button size="lg" className="gap-2">S'inscrire pour {course.price}€</Button>
          </Link>
        )}
        <Link to="/catalogue">
          <Button variant="outline">Retour au catalogue</Button>
        </Link>
      </div>
    )
  }

  const doneCount = completedLessons.length
  const progress = allLessons.length > 0 ? Math.round((doneCount / allLessons.length) * 100) : 0
  const activeIdx = allLessons.findIndex(l => l.id === activeLesson)
  const activeItem = allLessons[activeIdx]

  // Video URL — local dev: /api/v1/media/{id}/file (GET is public, no auth needed)
  const videoSrc = activeItem?.mediaId
    ? `/api/v1/media/${activeItem.mediaId}/file`
    : null

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
    else { videoRef.current.pause(); setIsPlaying(false) }
  }

  const seek = (value: number) => {
    if (videoRef.current) { videoRef.current.currentTime = value; setCurrentTime(value) }
  }

  const goNext = () => {
    if (activeLesson) markLessonComplete(activeLesson)
    if (activeIdx < allLessons.length - 1) {
      setActiveLesson(allLessons[activeIdx + 1]!.id)
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div className="-mx-8 -my-8 flex h-screen bg-background overflow-hidden">

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center gap-4 border-b border-border px-6 py-3 bg-card/80 backdrop-blur-sm">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground h-8 px-2.5">
              <ChevronLeft className="h-4 w-4" /> Mon espace
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <p className="text-sm font-semibold truncate flex-1">{course?.title ?? 'Cours'}</p>
          <Badge variant="muted" className="text-xs">{doneCount}/{allLessons.length} leçons</Badge>
          <Link to={`/chat/${courseId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <MessageSquare className="h-3.5 w-3.5" /> Chat
            </Button>
          </Link>
        </div>

        {/* ── Video Player ── */}
        <div className="bg-black flex-1 flex flex-col items-center justify-center relative overflow-hidden">
          {videoSrc ? (
            <>
              <video
                ref={videoRef}
                key={videoSrc}
                src={videoSrc}
                muted={muted}
                controls={false}
                className="w-full h-full object-contain"
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false)
                  if (activeLesson) markLessonComplete(activeLesson)
                }}
              />
              {/* Custom controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-6">
                {/* Progress / seek bar */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-white/60 shrink-0 tabular-nums">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.5}
                    value={currentTime}
                    onChange={e => seek(Number(e.target.value))}
                    className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.25) 0%)`,
                    }}
                  />
                  <span className="text-[11px] text-white/60 shrink-0 tabular-nums">{formatTime(duration)}</span>
                </div>

                {/* Button row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0"
                  >
                    {isPlaying
                      ? <span className="flex gap-0.5"><span className="w-1 h-3.5 bg-white rounded-sm" /><span className="w-1 h-3.5 bg-white rounded-sm" /></span>
                      : <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                    }
                  </button>
                  <button
                    onClick={() => setMuted(m => !m)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:text-white transition-colors shrink-0"
                  >
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <div className="flex-1" />
                  {activeLesson && !completedLessons.includes(activeLesson) && (
                    <button
                      onClick={() => markLessonComplete(activeLesson)}
                      className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white border border-white/20 rounded-full px-3 py-1 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Terminé
                    </button>
                  )}
                  {activeLesson && completedLessons.includes(activeLesson) && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Leçon complétée
                    </span>
                  )}
                  <button
                    onClick={goNext}
                    disabled={activeIdx >= allLessons.length - 1}
                    className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white disabled:opacity-30 transition-colors shrink-0"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="flex h-7 w-7 items-center justify-center rounded text-white/70 hover:text-white transition-colors shrink-0"
                  >
                    <Maximize className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // No video uploaded for this lesson
            <div className="flex flex-col items-center gap-4 text-white">
              <div className="absolute inset-0 gradient-hero opacity-20" />
              <div className="relative flex flex-col items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 cursor-pointer hover:bg-white/30 transition-colors"
                  onClick={() => activeLesson && markLessonComplete(activeLesson)}
                >
                  {activeLesson && completedLessons.includes(activeLesson)
                    ? <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    : <Play className="h-7 w-7 fill-white" />
                  }
                </div>
                <p className="text-sm text-white/60 text-center max-w-xs">
                  {activeItem
                    ? `"${activeItem.title}" — Aucune vidéo disponible pour cette leçon.`
                    : 'Sélectionnez une leçon dans le panneau latéral.'}
                </p>
                {activeLesson && !completedLessons.includes(activeLesson) && (
                  <button
                    onClick={() => markLessonComplete(activeLesson)}
                    className="text-xs text-white/50 hover:text-white/80 border border-white/20 rounded-full px-3 py-1 transition-colors"
                  >
                    Marquer comme terminé
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-t border-border bg-card px-6 py-4 shrink-0">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview" className="gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" /> Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> Ressources
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-1.5 text-xs">
                <StickyNote className="h-3.5 w-3.5" /> Mes notes
              </TabsTrigger>
              <TabsTrigger value="qa" className="gap-1.5 text-xs">
                <MessageSquare className="h-3.5 w-3.5" /> Q&A
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <h3 className="font-semibold mb-1.5">
                {activeItem?.title ?? 'Sélectionnez une leçon dans le menu latéral'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeItem
                  ? `Module : ${activeItem.sectionTitle}.${activeItem.mediaId ? ' Vidéo disponible.' : ' Aucune vidéo pour cette leçon.'}`
                  : 'Choisissez une leçon pour commencer votre apprentissage.'}
              </p>
              {progress === 100 && (
                <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <p className="text-sm font-medium">Félicitations ! Vous avez terminé ce cours. Votre certificat est disponible dans votre espace.</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="resources">
              <p className="text-sm text-muted-foreground mt-4">Aucune ressource téléchargeable pour cette leçon.</p>
            </TabsContent>
            <TabsContent value="notes">
              <textarea
                className="w-full h-20 text-sm border border-input rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
                placeholder="Prenez vos notes ici... (non sauvegardées)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="qa">
              <div className="mt-4 flex gap-3">
                <Link to={`/chat/${courseId}`}>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" /> Poser une question dans le chat
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="w-80 border-l border-border flex flex-col bg-card overflow-hidden shrink-0">
        {/* Progress */}
        <div className="p-4 border-b border-border space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progression</span>
            <span className="text-muted-foreground font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Lessons */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-1">
            {curriculum.map((section, si) => (
              <div key={si}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 py-2">
                  {section.title}
                </p>
                {(section.lessons ?? []).map((rawLesson, li) => {
                  const lesson = normalizeLesson(rawLesson)
                  const id = `${si}-${li}`
                  const done = completedLessons.includes(id)
                  const active = activeLesson === id
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveLesson(id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                        done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : active
                            ? "border-white/50 text-white/70"
                            : "border-border"
                      )}>
                        {done
                          ? <CheckCircle2 className="h-3.5 w-3.5" />
                          : <Play className="h-3 w-3" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="truncate font-medium text-xs block">{lesson.title}</span>
                        {lesson.mediaId && (
                          <span className="text-[10px] opacity-60">▶ Vidéo disponible</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
            {curriculum.length === 0 && (
              <p className="text-xs text-muted-foreground px-3 py-4 text-center">
                Programme en cours de construction.
              </p>
            )}
          </div>
        </div>

        {/* Next */}
        <div className="p-4 border-t border-border">
          <Button className="w-full gap-2" size="sm" onClick={goNext} disabled={activeIdx >= allLessons.length - 1}>
            Leçon suivante <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

    </div>
  )
}
