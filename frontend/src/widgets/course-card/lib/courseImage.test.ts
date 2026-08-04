import { describe, it, expect } from 'vitest'
import { courseSchema } from '@/entities/course/model/course.schema'
import { IMAGES } from '@/shared/config/images/manifest'
import { courseImage } from './courseImage'

function makeCourse(title: string, department: string, filiere = '') {
  return courseSchema.parse({ id: title, slug: title, title, department, filiere })
}

describe('courseImage', () => {
  it('maps an explicitly listed course to its dedicated image, not a rotation', () => {
    const course = makeCourse(
      "Bachelor's in Voice & Vocal Technique",
      'Performance & Instrumental Practice',
      'Voice & Vocal Arts',
    )
    expect(courseImage(course)).toBe(IMAGES.heroStage)
  })

  it('maps the new audiovisual/broadcast course to the new broadcastStudio image', () => {
    const course = makeCourse(
      "Bachelor's in Audiovisual & Broadcast",
      'Music Technology & Audiovisual Production',
      'Audiovisual & Digital Media',
    )
    expect(courseImage(course)).toBe(IMAGES.broadcastStudio)
  })

  it('maps film & media composition courses to the filmScoring image', () => {
    const course = makeCourse(
      "Master's in Film & Media Composition",
      'Composition, Writing & Music Theory',
      'Composition for Picture & Media',
    )
    expect(courseImage(course)).toBe(IMAGES.filmScoring)
  })

  it('maps musicology courses to the musicologyArchive image', () => {
    const course = makeCourse(
      'Doctorate in Musicology — Ph.D',
      'Musicology, Heritage & Cultural Management',
      'Musicology & Heritage Research',
    )
    expect(courseImage(course)).toBe(IMAGES.musicologyArchive)
  })

  it('maps cultural-management courses to the musicBusiness image', () => {
    const course = makeCourse(
      "Master's in Arts & Cultural Industries Management",
      'Musicology, Heritage & Cultural Management',
      'Cultural Management & Global Music Business',
    )
    expect(courseImage(course)).toBe(IMAGES.musicBusiness)
  })

  it('falls back to a department-level image for an unlisted course title, never a meaningless rotation', () => {
    const course = makeCourse(
      'Some Future Course Not Yet Mapped',
      'Music Education & Teacher Training',
      'Some New Filiere',
    )
    expect(courseImage(course)).toBe(IMAGES.classroom)
  })

  it('falls back to a generic default when even the department is unknown', () => {
    const course = makeCourse('Totally Unknown Course', 'Unknown Department')
    expect(courseImage(course)).toBe(IMAGES.pianoHands)
  })
})
