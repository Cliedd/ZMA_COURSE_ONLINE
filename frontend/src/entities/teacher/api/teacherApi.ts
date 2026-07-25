import { courseApi } from '@/entities/course'
import { deriveTeachers, findTeacher, coursesOfTeacher } from '../lib/deriveTeachers'
import type { Teacher } from '../lib/deriveTeachers'
import type { Course } from '@/entities/course'

// Récupère un large échantillon de cours publiés pour dériver les enseignants.
async function allCourses(): Promise<Course[]> {
  const page = await courseApi.list({ size: 100 })
  return page.content
}

export const teacherApi = {
  list: async (): Promise<Teacher[]> => deriveTeachers(await allCourses()),

  getByUsername: async (username: string): Promise<{ teacher: Teacher | null; courses: Course[] }> => {
    const courses = await allCourses()
    const teacher = findTeacher(courses, username)
    return { teacher, courses: teacher ? coursesOfTeacher(courses, teacher.name) : [] }
  },
}
