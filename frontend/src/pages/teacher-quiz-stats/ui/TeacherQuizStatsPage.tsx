import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, BarChart2, Loader2 } from 'lucide-react'
import { useCourseById, courseCurriculum } from '@/entities/course'
import { useQuizByLesson, useQuizStats } from '../../../hooks/useQuiz'

// Simple stats card for a single quiz/lesson
function QuizStatCard({ lessonTitle, lessonId }: { lessonTitle: string; lessonId: string }) {
  const { data: quiz } = useQuizByLesson(lessonId)
  const { data: stats } = useQuizStats(quiz?.id)

  if (!quiz) return null

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-sm">{lessonTitle}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{quiz.title} — {quiz.mode === 'TRAINING' ? 'Examen de test' : 'Examen de passage'}</p>
        </div>
        <BarChart2 className="h-4 w-4 text-muted-foreground" />
      </div>
      {stats ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-serif text-ink">{stats.totalAttempts}</p>
            <p className="text-[11px] text-muted-foreground">Tentatives</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-serif text-success">{stats.passedFirst}</p>
            <p className="text-[11px] text-muted-foreground">Réussi 1ère fois</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-serif text-destructive">{stats.failed}</p>
            <p className="text-[11px] text-muted-foreground">Échoué</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-serif text-ink">{stats.avgScore}%</p>
            <p className="text-[11px] text-muted-foreground">Score moyen</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Aucune tentative pour le moment.</p>
      )}
    </div>
  )
}

export function TeacherQuizStatsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { data: course, isLoading } = useCourseById(courseId ?? '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Parse curriculum via the shared helper which normalises lessons and backfills
  // missing IDs (lessons created before the `id` field was introduced get a
  // stable in-memory UUID here; they'll be persisted on the next course save).
  const curriculum = course ? courseCurriculum(course) : []
  const allLessons: { sectionTitle: string; lessonTitle: string; lessonId: string }[] = []
  for (const section of curriculum) {
    for (const lesson of section.lessons) {
      if (lesson.id) {
        allLessons.push({
          sectionTitle: section.title,
          lessonTitle: lesson.title,
          lessonId: lesson.id,
        })
      }
    }
  }

  return (
    <div className="container py-8 max-w-3xl">
      <Link to="/teacher" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />
        Tableau de bord
      </Link>
      <h1 className="font-serif text-2xl text-ink mb-2">Statistiques des quiz</h1>
      <p className="text-sm text-muted-foreground mb-8">{course?.title}</p>

      {allLessons.length === 0 ? (
        <p className="text-muted-foreground text-sm">Ce cours n'a pas encore de leçons avec des identifiants.</p>
      ) : (
        <div className="space-y-4">
          {allLessons.map(l => (
            <QuizStatCard key={l.lessonId} lessonTitle={l.lessonTitle} lessonId={l.lessonId} />
          ))}
        </div>
      )}
    </div>
  )
}
