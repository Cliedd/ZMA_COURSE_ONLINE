/**
 * Inventaire des visuels du site.
 *
 * `source: 'ztf'`          — vraie photo de la ZTF Music Academy (fournies par
 *                            l'équipe, issues du site officiel).
 * `source: 'ztf-pending'`  — emplacement réservé à du matériel réel encore absent
 *                            (ex. portrait d'un enseignant nommé). Tant qu'il manque,
 *                            la surface affiche un état vide plutôt qu'un visage inventé.
 * `source: 'ai-generated'` — visuel généré via le pipeline Pollinations.ai décrit dans
 *                            src/lib/images.ts, pour un département sans photo réelle
 *                            disponible. Téléchargé une fois puis committé comme asset
 *                            statique (jamais référencé en direct depuis Pollinations),
 *                            et passé par le même étalonnage `images:encode` que les
 *                            vraies photos pour rester visuellement cohérent avec elles.
 *
 * Les fichiers vivent dans public/images/<base>-<largeur>.<avif|webp|jpg>,
 * produits par `npm run images:encode` depuis public/images/_source/<base>.jpg.
 *
 * Le site étant désormais anglophone par défaut (chantier 6), les textes alternatifs
 * sont rédigés en anglais, de façon factuelle et laïque — sans cadrage religieux,
 * communautaire ou « patrimoine culturel africain » (voir plan de chantier).
 */

export interface ImageEntry {
  base: string
  /** Dimensions intrinsèques du plus grand rendu — nécessaires pour le CLS. */
  width: number
  height: number
  alt: string
  source: 'ztf' | 'ztf-pending' | 'ai-generated'
}

export const IMAGE_WIDTHS = [400, 800, 1200, 1600] as const

export const IMAGES = {
  heroStage: {
    base: 'hero-2',
    width: 1280,
    height: 853,
    alt: 'A vocal recording session at ZTF Music Academy',
    source: 'ztf',
  },
  heroEnsemble: {
    base: 'hero-3',
    width: 1280,
    height: 960,
    alt: 'Students rehearsing together at ZTF Music Academy',
    source: 'ztf',
  },
  pianoHands: {
    base: 'course-piano',
    width: 760,
    height: 473,
    alt: 'Hands on a piano keyboard',
    source: 'ztf',
  },
  strings: {
    base: 'course-guitar',
    width: 1920,
    height: 1081,
    alt: 'A guitar lesson at ZTF Music Academy',
    source: 'ztf',
  },
  bass: {
    base: 'course-bass',
    width: 1280,
    height: 640,
    alt: 'A bass guitar lesson at ZTF Music Academy',
    source: 'ztf',
  },
  drums: {
    base: 'course-drums',
    width: 760,
    height: 505,
    alt: 'Drums and percussion at ZTF Music Academy',
    source: 'ztf',
  },
  studioDesk: {
    base: 'feature-1',
    width: 960,
    height: 1280,
    alt: 'In the recording studio at ZTF Music Academy',
    source: 'ztf',
  },
  studioMixing: {
    base: 'feature-2',
    width: 960,
    height: 1280,
    alt: 'A student mixing a track in the production studio',
    source: 'ztf',
  },
  score: {
    base: 'gallery-ear',
    width: 1280,
    height: 960,
    alt: 'Ear-training practice at ZTF Music Academy',
    source: 'ztf',
  },
  classroom: {
    base: 'hero-1',
    width: 520,
    height: 390,
    alt: 'A keyboard class at ZTF Music Academy',
    source: 'ztf',
  },
  ensemble: {
    base: 'gallery-creativity',
    width: 1280,
    height: 960,
    alt: 'A student ensemble performing at ZTF Music Academy',
    source: 'ztf',
  },
  campus: {
    base: 'about-large',
    width: 1280,
    height: 960,
    alt: 'The ZTF Music Academy campus',
    source: 'ztf',
  },
  campusHallway: {
    base: 'about-small',
    width: 1280,
    height: 720,
    alt: 'A hallway at ZTF Music Academy',
    source: 'ztf',
  },
  levelBeginner: {
    base: 'level-beginner',
    width: 520,
    height: 390,
    alt: 'A beginner student taking a first music lesson',
    source: 'ztf',
  },
  levelIntermediate: {
    base: 'level-intermediate',
    width: 1280,
    height: 960,
    alt: 'An intermediate-level student practicing with a teacher',
    source: 'ztf',
  },
  levelAdvanced: {
    base: 'level-advanced',
    width: 1280,
    height: 960,
    alt: 'An advanced student rehearsing for a performance',
    source: 'ztf',
  },
  whyChooseUs: {
    base: 'why-choose-us',
    width: 520,
    height: 520,
    alt: 'Students collaborating during a lesson at ZTF Music Academy',
    source: 'ztf',
  },
  facultyPortrait: {
    base: 'faculty-portrait',
    width: 800,
    height: 800,
    alt: 'Portrait of a ZTF Music Academy teacher',
    source: 'ztf-pending',
  },
  broadcastStudio: {
    base: 'broadcast-studio',
    width: 940,
    height: 627,
    alt: 'A student operating a camera and vision-mixing desk in a broadcast studio',
    source: 'ai-generated',
  },
  filmScoring: {
    base: 'film-scoring',
    width: 940,
    height: 627,
    alt: 'A composer working at a DAW with a film timeline on dual monitors',
    source: 'ai-generated',
  },
  musicologyArchive: {
    base: 'musicology-archive',
    width: 940,
    height: 627,
    alt: 'A student researching scores and reference books in a music library archive',
    source: 'ai-generated',
  },
  musicBusiness: {
    base: 'music-business',
    width: 940,
    height: 627,
    alt: 'A music-business professional reviewing a contract in a modern office',
    source: 'ai-generated',
  },
} as const satisfies Record<string, ImageEntry>

export type ImageKey = keyof typeof IMAGES
