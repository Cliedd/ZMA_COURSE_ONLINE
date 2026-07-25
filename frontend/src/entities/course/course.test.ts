import { http, HttpResponse } from 'msw'
import { describe, it, expect } from 'vitest'
import { mswServer } from '@/test/msw'
import { courseSchema } from './model/course.schema'
import { courseApi } from './api/courseApi'
import { courseSkills, courseOutcomes, courseCurriculum, curriculumLessonCount } from './lib/parseCourse'
import { AppError } from '@/shared/api/http'

const API = 'http://localhost/api/v1'

const minimalCourse = { id: '1', slug: 'piano', title: 'Piano classique' }

describe('courseSchema', () => {
  it('accepte un cours minimal et applique les valeurs par défaut', () => {
    const c = courseSchema.parse(minimalCourse)
    expect(c.price).toBe(0)
    expect(c.rating).toBeNull()
    expect(c.sections).toEqual([])
    expect(c.published).toBe(true)
  })

  it('rejette un cours sans identifiant', () => {
    expect(() => courseSchema.parse({ slug: 'x', title: 'y' })).toThrow()
  })

  it('conserve les champs fournis', () => {
    const c = courseSchema.parse({ ...minimalCourse, price: 18, rating: 4.9, level: 'Licence', ects: 12 })
    expect(c.price).toBe(18)
    expect(c.rating).toBe(4.9)
    expect(c.ects).toBe(12)
  })
})

describe('parseCourse', () => {
  it('parse les compétences en JSON', () => {
    const c = courseSchema.parse({ ...minimalCourse, skillsJson: '["Lecture","Rythme"]' })
    expect(courseSkills(c)).toEqual(['Lecture', 'Rythme'])
  })

  it('parse les compétences séparées par des barres', () => {
    const c = courseSchema.parse({ ...minimalCourse, skillsJson: 'Lecture|Rythme|Harmonie' })
    expect(courseSkills(c)).toEqual(['Lecture', 'Rythme', 'Harmonie'])
  })

  it('ne casse pas sur un JSON invalide', () => {
    const c = courseSchema.parse({ ...minimalCourse, skillsJson: '{cassé' })
    expect(courseSkills(c)).toEqual([])
  })

  it('parse les débouchés séparés par des barres', () => {
    const c = courseSchema.parse({ ...minimalCourse, debouches: 'Concertiste|Professeur' })
    expect(courseOutcomes(c)).toEqual(['Concertiste', 'Professeur'])
  })

  it('parse et compte le programme', () => {
    const curriculum = JSON.stringify([{ id: 's1', title: 'Fondations', lessons: ['A', 'B'] }, { id: 's2', title: 'Suite', lessons: ['C'] }])
    const c = courseSchema.parse({ ...minimalCourse, curriculumJson: curriculum })
    const sections = courseCurriculum(c)
    expect(sections).toHaveLength(2)
    expect(sections[0]!.lessons).toEqual(['A', 'B'])
    expect(curriculumLessonCount(sections)).toBe(3)
  })
})

describe('courseApi', () => {
  it('liste les cours depuis une page Spring et valide la réponse', async () => {
    mswServer.use(http.get(`${API}/courses`, () =>
      HttpResponse.json({ content: [minimalCourse], totalElements: 1, number: 0, totalPages: 1 }),
    ))
    const page = await courseApi.list({ department: 'Interprétation' })
    expect(page.content).toHaveLength(1)
    expect(page.content[0]!.title).toBe('Piano classique')
    expect(page.totalElements).toBe(1)
  })

  it('récupère un cours par son slug', async () => {
    mswServer.use(http.get(`${API}/courses/slug/piano`, () => HttpResponse.json(minimalCourse)))
    const c = await courseApi.getBySlug('piano')
    expect(c.slug).toBe('piano')
  })

  it('lève une AppError si la réponse ne correspond pas au schéma', async () => {
    mswServer.use(http.get(`${API}/courses/slug/piano`, () => HttpResponse.json({ slug: 'piano' })))
    await expect(courseApi.getBySlug('piano')).rejects.toBeInstanceOf(AppError)
  })
})
