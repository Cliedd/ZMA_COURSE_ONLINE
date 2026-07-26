import type { Course } from '@/entities/course'

export interface CourseRevenue {
  course: Course
  revenue: number
}

/** Revenu potentiel estimé d'un cours : prix unitaire × nombre d'inscrits. */
function potentialRevenue(course: Course): number {
  return course.price * course.studentsCount
}

/** Dérive les statistiques financières d'une page de cours (estimation, pas de vraies données de paiement). */
export function computeFinanceStats(courses: Course[]) {
  const totalRevenue = courses.reduce((sum, c) => sum + potentialRevenue(c), 0)
  const paidCount = courses.filter((c) => c.price > 0).length
  const freeCount = courses.length - paidCount
  const topCourses: CourseRevenue[] = [...courses]
    .map((course) => ({ course, revenue: potentialRevenue(course) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return { totalRevenue, paidCount, freeCount, topCourses }
}
