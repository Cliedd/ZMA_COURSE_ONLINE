import { z } from 'zod'

/** Niveaux académiques (correspond verbatim au champ `level` du backend — voir
 * DataLoader.java. Ne JAMAIS traduire ces valeurs : elles sont envoyées telles
 * quelles en paramètre de filtre et doivent matcher la taxonomie stockée en base. */
export const COURSE_LEVELS = ["Bachelor's", "Master's", 'Doctorate', 'Certificate', 'Workshop'] as const
export type CourseLevel = (typeof COURSE_LEVELS)[number]

/** Une leçon dans une section (le backend accepte string ou objet). */
const lessonSchema = z.union([
  z.string(),
  z.object({ title: z.string(), mediaId: z.string().nullish() }),
])

const sectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  lessons: z.array(lessonSchema).default([]),
})

/**
 * Cours tel que renvoyé par le catalogue. Tolérant par conception : le backend
 * omet parfois des champs lourds (sections) sur la liste, et certains champs
 * sont nullables. La validation reste à la frontière (spec § 7.2).
 */
export const courseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullish().transform((v) => v ?? ''),
  shortDescription: z.string().nullish().transform((v) => v ?? ''),
  price: z.number().nullish().transform((v) => v ?? 0),
  level: z.string().nullish().transform((v) => v ?? 'Workshop'),
  department: z.string().nullish().transform((v) => v ?? ''),
  filiere: z.string().nullish().transform((v) => v ?? ''),
  ects: z.number().nullish().transform((v) => v ?? null),
  teacherName: z.string().nullish().transform((v) => v ?? ''),
  teacherEmail: z.string().nullish().transform((v) => v ?? ''),
  studentsCount: z.number().nullish().transform((v) => v ?? 0),
  rating: z.number().nullish().transform((v) => v ?? null),
  durationHours: z.number().nullish().transform((v) => v ?? 0),
  gradientIndex: z.number().nullish().transform((v) => v ?? 0),
  lessonCount: z.number().nullish().transform((v) => v ?? 0),
  skillsJson: z.string().nullish().transform((v) => v ?? ''),
  curriculumJson: z.string().nullish().transform((v) => v ?? ''),
  debouches: z.string().nullish().transform((v) => v ?? ''),
  published: z.boolean().nullish().transform((v) => v ?? true),
  sections: z.array(sectionSchema).nullish().transform((v) => v ?? []),
})

export type Course = z.infer<typeof courseSchema>

export const reviewSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  studentId: z.string().nullish().transform((v) => v ?? ''),
  rating: z.number().nullish().transform((v) => v ?? 0),
  comment: z.string().nullish().transform((v) => v ?? ''),
  createdAt: z.string().nullish().transform((v) => v ?? ''),
})

export type Review = z.infer<typeof reviewSchema>

/** Enveloppe de pagination Spring Data. */
export const coursePageSchema = z.object({
  content: z.array(courseSchema).default([]),
  totalElements: z.number().nullish().transform((v) => v ?? 0),
  number: z.number().nullish().transform((v) => v ?? 0),
  totalPages: z.number().nullish().transform((v) => v ?? 0),
})
export type CoursePage = z.infer<typeof coursePageSchema>
