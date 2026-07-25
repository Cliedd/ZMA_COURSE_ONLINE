import { IMAGES } from '@/shared/config/images/manifest'
import type { ImageEntry } from '@/shared/config/images/manifest'
import type { Course } from '@/entities/course'

// Vraies photos de la ZTF Music Academy.
const POOL: ImageEntry[] = [IMAGES.pianoHands, IMAGES.strings, IMAGES.drums, IMAGES.ensemble, IMAGES.score, IMAGES.heroStage]

const KEYWORD_MAP: Array<[RegExp, ImageEntry]> = [
  [/piano|clavier|harmon/i, IMAGES.pianoHands],
  [/basse|bass/i, IMAGES.bass],
  [/cord|violon|guitar|guitare|alto|violoncell/i, IMAGES.strings],
  [/percus|batterie|drum|djemb/i, IMAGES.drums],
  [/studio|prod|mix|audio|mao|son|enregistr/i, IMAGES.studioDesk],
  [/compos|écrit|ecrit|théor|theor|orchestr|partition|solf/i, IMAGES.score],
  [/chant|voix|vocal|scène|scene|jazz|concert|chœur|choeur/i, IMAGES.heroStage],
]

/**
 * Choisit un visuel pour un cours d'après son intitulé et son département.
 * Déterministe (même cours → même image) : d'abord par mot-clé, sinon par
 * `gradientIndex` pour rester stable entre les rendus.
 */
export function courseImage(course: Course): ImageEntry {
  const haystack = `${course.title} ${course.department} ${course.filiere}`
  for (const [pattern, image] of KEYWORD_MAP) {
    if (pattern.test(haystack)) return image
  }
  return POOL[course.gradientIndex % POOL.length] ?? IMAGES.pianoHands
}
