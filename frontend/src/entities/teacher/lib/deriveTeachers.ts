import type { Course } from '@/entities/course'
import { slugify } from '@/shared/lib/slugify'

export interface Teacher {
  /** Identifiant d'URL, dérivé du nom. */
  username: string
  name: string
  email: string
  courseCount: number
  studentsCount: number
  /** Moyenne des notes de ses cours notés, ou null. */
  avgRating: number | null
  departments: string[]
}

/**
 * Dérive la liste des enseignants depuis les cours (il n'existe pas de service
 * enseignant côté backend — l'information est portée par chaque cours).
 */
export function deriveTeachers(courses: Course[]): Teacher[] {
  const byName = new Map<string, Course[]>()
  for (const course of courses) {
    if (!course.teacherName) continue
    const list = byName.get(course.teacherName) ?? []
    list.push(course)
    byName.set(course.teacherName, list)
  }

  return Array.from(byName.entries())
    .map(([name, list]) => teacherFrom(name, list))
    .sort((a, b) => b.courseCount - a.courseCount)
}

/** Retrouve un enseignant par son username parmi les cours. */
export function findTeacher(courses: Course[], username: string): Teacher | null {
  return deriveTeachers(courses).find((t) => t.username === username) ?? null
}

/** Cours d'un enseignant donné (par nom). */
export function coursesOfTeacher(courses: Course[], name: string): Course[] {
  return courses.filter((c) => c.teacherName === name)
}

function teacherFrom(name: string, list: Course[]): Teacher {
  const rated = list.filter((c) => c.rating != null)
  const avgRating = rated.length
    ? rated.reduce((sum, c) => sum + (c.rating ?? 0), 0) / rated.length
    : null
  return {
    username: slugify(name),
    name,
    email: list.find((c) => c.teacherEmail)?.teacherEmail ?? '',
    courseCount: list.length,
    studentsCount: list.reduce((sum, c) => sum + c.studentsCount, 0),
    avgRating: avgRating != null ? Math.round(avgRating * 10) / 10 : null,
    departments: Array.from(new Set(list.map((c) => c.department).filter(Boolean))),
  }
}
