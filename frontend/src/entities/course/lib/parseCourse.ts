import type { Course } from '../model/course.schema'

/** Génère un identifiant stable pour une leçon (UUID v4 si disponible, sinon timestamp+random). */
function makeLessonId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `l${Date.now()}${Math.round(Math.random() * 1_000_000)}`
}

/** Compétences (`skillsJson`) parsées, avec repli sûr sur tableau vide. */
export function courseSkills(course: Course): string[] {
  return safeParseArray(course.skillsJson)
}

/** Débouchés (`debouches`), séparés par `|` côté backend. */
export function courseOutcomes(course: Course): string[] {
  return course.debouches ? course.debouches.split('|').map((s) => s.trim()).filter(Boolean) : []
}

/** Une leçon normalisée côté front : toujours un objet, même si le backend
 * accepte aussi une simple chaîne (voir lessonSchema, course.schema.ts). */
export interface CurriculumLesson {
  /** Identifiant stable, assigné à la création et persisté dans curriculumJson.
   * Utilisé comme clé pour les quiz et les statistiques (TeacherQuizStatsPage). */
  id?: string
  title: string
  /** Média (vidéo) attaché via zma-media, ou absent/null tant qu'aucune vidéo n'est liée. */
  mediaId?: string | null
}

export interface CurriculumSection {
  id: string
  title: string
  lessons: CurriculumLesson[]
}

/** Libellé affichable d'une leçon, qu'elle soit encore une chaîne brute ou déjà normalisée. */
export function lessonTitle(lesson: string | CurriculumLesson): string {
  return typeof lesson === 'string' ? lesson : lesson.title
}

/** Programme (`curriculumJson`) parsé et normalisé. */
export function courseCurriculum(course: Course): CurriculumSection[] {
  const raw = safeParseUnknown(course.curriculumJson)
  if (!Array.isArray(raw)) return []
  return raw.map((section, index) => {
    const s = section as { id?: unknown; title?: unknown; lessons?: unknown }
    return {
      id: typeof s.id === 'string' ? s.id : `s${index}`,
      title: typeof s.title === 'string' ? s.title : '',
      lessons: Array.isArray(s.lessons)
        ? s.lessons
            .map((l): CurriculumLesson | null => {
              if (typeof l === 'string') return l ? { id: makeLessonId(), title: l, mediaId: null } : null
              const obj = l as { id?: unknown; title?: unknown; mediaId?: unknown }
              const title = typeof obj.title === 'string' ? obj.title : ''
              if (!title) return null
              return {
                // Backfill stable id for lessons saved before this field was introduced.
                id: typeof obj.id === 'string' && obj.id ? obj.id : makeLessonId(),
                title,
                mediaId: typeof obj.mediaId === 'string' ? obj.mediaId : null,
              }
            })
            .filter((l): l is CurriculumLesson => l !== null)
        : [],
    }
  })
}

/** Nombre total de leçons du programme, quand `lessonCount` est absent. */
export function curriculumLessonCount(sections: CurriculumSection[]): number {
  return sections.reduce((total, s) => total + s.lessons.length, 0)
}

function safeParseUnknown(json: string): unknown {
  if (!json) return null
  try {
    return JSON.parse(json)
  } catch {
    return null
  }
}

function safeParseArray(json: string): string[] {
  const parsed = safeParseUnknown(json)
  if (!Array.isArray(parsed)) {
    // Certains champs sont des chaînes séparées par `|` plutôt que du JSON.
    return json && json.includes('|') ? json.split('|').map((s) => s.trim()).filter(Boolean) : []
  }
  return parsed.filter((v): v is string => typeof v === 'string')
}
