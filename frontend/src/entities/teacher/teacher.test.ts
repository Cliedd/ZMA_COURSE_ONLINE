import { describe, it, expect } from 'vitest'
import { deriveTeachers, findTeacher, coursesOfTeacher } from './lib/deriveTeachers'
import { courseSchema } from '@/entities/course'

function course(over: Record<string, unknown>) {
  return courseSchema.parse({ id: Math.random().toString(), slug: 's' + Math.random(), title: 'T', ...over })
}

const courses = [
  course({ teacherName: 'Amara Diallo', teacherEmail: 'amara@ztf.cm', department: 'Interprétation', rating: 4.8, studentsCount: 100 }),
  course({ teacherName: 'Amara Diallo', teacherEmail: 'amara@ztf.cm', department: 'Composition', rating: 5.0, studentsCount: 50 }),
  course({ teacherName: 'Kofi Mensah', teacherEmail: 'kofi@ztf.cm', department: 'Technologies', rating: null, studentsCount: 30 }),
  course({ teacherName: '', department: 'X' }),
]

describe('deriveTeachers', () => {
  it('regroupe les cours par enseignant et ignore les cours sans enseignant', () => {
    const teachers = deriveTeachers(courses)
    expect(teachers).toHaveLength(2)
  })

  it('agrège cours, étudiants et note moyenne', () => {
    const amara = deriveTeachers(courses).find((t) => t.name === 'Amara Diallo')!
    expect(amara.courseCount).toBe(2)
    expect(amara.studentsCount).toBe(150)
    expect(amara.avgRating).toBe(4.9)
    expect(amara.departments).toEqual(['Interprétation', 'Composition'])
  })

  it('donne une note null quand aucun cours n\'est noté', () => {
    const kofi = deriveTeachers(courses).find((t) => t.name === 'Kofi Mensah')!
    expect(kofi.avgRating).toBeNull()
  })

  it('génère un username sans accent depuis le nom', () => {
    const amara = deriveTeachers(courses).find((t) => t.name === 'Amara Diallo')!
    expect(amara.username).toBe('amara-diallo')
  })

  it('trie par nombre de cours décroissant', () => {
    const teachers = deriveTeachers(courses)
    expect(teachers[0]!.name).toBe('Amara Diallo')
  })

  it('retrouve un enseignant par username et ses cours', () => {
    const found = findTeacher(courses, 'kofi-mensah')
    expect(found?.name).toBe('Kofi Mensah')
    expect(coursesOfTeacher(courses, 'Kofi Mensah')).toHaveLength(1)
  })
})
