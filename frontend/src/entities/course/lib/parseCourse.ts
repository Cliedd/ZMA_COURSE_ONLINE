import type { Course } from '../model/course.schema'

/** Compétences (`skillsJson`) parsées, avec repli sûr sur tableau vide. */
export function courseSkills(course: Course): string[] {
  return safeParseArray(course.skillsJson)
}

/** Débouchés (`debouches`), séparés par `|` côté backend. */
export function courseOutcomes(course: Course): string[] {
  return course.debouches ? course.debouches.split('|').map((s) => s.trim()).filter(Boolean) : []
}

export interface CurriculumSection {
  id: string
  title: string
  lessons: string[]
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
        ? s.lessons.map((l) => (typeof l === 'string' ? l : String((l as { title?: unknown })?.title ?? ''))).filter(Boolean)
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
