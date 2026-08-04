import { IMAGES } from '@/shared/config/images/manifest'
import type { ImageEntry } from '@/shared/config/images/manifest'
import type { Course } from '@/entities/course'

/**
 * Visuel explicite par cours, indexé sur l'intitulé exact (voir DataLoader.java
 * côté backend, catalogue anglophone à 32 cours). Un système par mots-clés
 * regex avait été utilisé auparavant ; il reposait sur des motifs français
 * (`/chant|voix|vocal|.../i`) et s'est brisé silencieusement au passage du
 * catalogue en anglais (chantier 6), faisant retomber presque tous les cours
 * sur une rotation arbitraire (`gradientIndex % POOL.length`) sans rapport
 * avec le contenu du cours. Cette table explicite est déterministe et ne peut
 * pas se désynchroniser en silence : un nouveau cours sans entrée retombe sur
 * un visuel de département, jamais sur une rotation aléatoire.
 */
const COURSE_IMAGE_BY_TITLE: Record<string, ImageEntry> = {
  // Performance & Instrumental Practice — Classical & Contemporary Music
  "Bachelor's in Instrumental Performance": IMAGES.pianoHands,
  'Certificate in Instrumental Advancement': IMAGES.strings,
  'Doctorate in Artistic Practice (DMA)': IMAGES.levelAdvanced,
  "Master's in Performance & Artistic Research": IMAGES.ensemble,

  // Performance & Instrumental Practice — Jazz & Contemporary Music
  "Bachelor's in Jazz & Improvised Music": IMAGES.heroEnsemble,
  'Certificate in Jazz & Arranging': IMAGES.ensemble,
  "Master's in Jazz Performance & Ensemble Direction": IMAGES.heroEnsemble,

  // Performance & Instrumental Practice — Voice & Vocal Arts
  "Bachelor's in Voice & Vocal Technique": IMAGES.heroStage,
  'Certificate in Vocal Technique': IMAGES.heroStage,
  "Master's in Opera Singing & Vocal Arts": IMAGES.heroStage,

  // Performance & Instrumental Practice — World Music, Tradition & Contemporary Creation
  "Bachelor's in World Percussion & Global Music Traditions": IMAGES.drums,
  'Certificate in World Instruments — Practice & Repertoire': IMAGES.drums,
  "Master's in Global Fusion Performance & Original Creation": IMAGES.ensemble,

  // Music Technology & Audiovisual Production — Sound Engineering & Music Production
  "Bachelor's in Sound Engineering & Music Production": IMAGES.studioDesk,
  'Certificate in Mastering & Streaming Preparation': IMAGES.studioMixing,
  'Certificate in Professional Home Studio': IMAGES.studioDesk,
  "Master's in Advanced Music Production, Mixing & Post-Production": IMAGES.studioMixing,

  // Music Technology & Audiovisual Production — Audiovisual & Digital Media
  "Bachelor's in Audiovisual & Broadcast": IMAGES.broadcastStudio,
  "Master's in Post-Production & Sound Design": IMAGES.studioMixing,

  // Composition, Writing & Music Theory — Composition & Orchestration
  "Bachelor's in Composition & Music Writing": IMAGES.score,
  'Certificate in Orchestration': IMAGES.score,
  "Master's in Composition & Musical Creation": IMAGES.score,

  // Composition, Writing & Music Theory — Composition for Picture & Media
  'Certificate in Film Music & Sound Design': IMAGES.filmScoring,
  "Master's in Film & Media Composition": IMAGES.filmScoring,

  // Music Education & Teacher Training
  "Bachelor's in Music Education": IMAGES.classroom,
  'Certificate in Musical Awakening & Introduction (Ages 0–12)': IMAGES.levelBeginner,
  "Master's in Music Didactics & Transmission": IMAGES.classroom,

  // Musicology, Heritage & Cultural Management — Musicology & Heritage Research
  "Bachelor's in Musicology & World Musical Heritage": IMAGES.musicologyArchive,
  'Doctorate in Musicology — Ph.D': IMAGES.musicologyArchive,
  "Master's in Ethnomusicology & Intangible Heritage Conservation": IMAGES.musicologyArchive,

  // Musicology, Heritage & Cultural Management — Cultural Management & Global Music Business
  'Certificate in Artist Career Management in the Digital Age': IMAGES.musicBusiness,
  "Master's in Arts & Cultural Industries Management": IMAGES.musicBusiness,
}

/** Visuel de repli par département, pour tout cours non listé ci-dessus (défensif). */
const DEPARTMENT_FALLBACK: Record<string, ImageEntry> = {
  'Performance & Instrumental Practice': IMAGES.ensemble,
  'Music Technology & Audiovisual Production': IMAGES.studioDesk,
  'Composition, Writing & Music Theory': IMAGES.score,
  'Music Education & Teacher Training': IMAGES.classroom,
  'Musicology, Heritage & Cultural Management': IMAGES.musicologyArchive,
}

/**
 * Choisit un visuel pour un cours. Déterministe et explicite : la table
 * `COURSE_IMAGE_BY_TITLE` couvre les 32 cours du catalogue par intitulé exact.
 * Pour un cours absent de la table (nouveau cours pas encore cartographié),
 * on retombe sur un visuel de département plutôt que sur une rotation
 * arbitraire — jamais de visuel sans rapport avec le contenu du cours.
 */
export function courseImage(course: Course): ImageEntry {
  return (
    COURSE_IMAGE_BY_TITLE[course.title] ??
    DEPARTMENT_FALLBACK[course.department] ??
    IMAGES.pianoHands
  )
}
