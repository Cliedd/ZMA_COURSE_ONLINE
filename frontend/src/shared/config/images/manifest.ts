/**
 * Inventaire des visuels du site.
 *
 * `source: 'ztf'`         — vraie photo de la ZTF Music Academy (fournies par
 *                           l'équipe, issues du site officiel).
 * `source: 'ztf-pending'` — emplacement réservé à du matériel réel encore absent
 *                           (ex. portrait d'un enseignant nommé). Tant qu'il manque,
 *                           la surface affiche un état vide plutôt qu'un visage inventé.
 *
 * Les fichiers vivent dans public/images/<base>-<largeur>.<avif|webp|jpg>,
 * produits par `npm run images:encode` depuis public/images/_source/<base>.jpg.
 */

export interface ImageEntry {
  base: string
  /** Dimensions intrinsèques du plus grand rendu — nécessaires pour le CLS. */
  width: number
  height: number
  alt: string
  source: 'ztf' | 'ztf-pending'
}

export const IMAGE_WIDTHS = [400, 800, 1200, 1600] as const

export const IMAGES = {
  heroStage: {
    base: 'hero-2',
    width: 1280,
    height: 853,
    alt: "Session d'enregistrement vocal à la ZTF Music Academy",
    source: 'ztf',
  },
  pianoHands: {
    base: 'course-piano',
    width: 760,
    height: 473,
    alt: "Main sur le clavier d'un piano",
    source: 'ztf',
  },
  strings: {
    base: 'course-guitar',
    width: 1920,
    height: 1081,
    alt: 'Cours de guitare à la ZTF Music Academy',
    source: 'ztf',
  },
  bass: {
    base: 'course-bass',
    width: 1280,
    height: 640,
    alt: 'Cours de basse à la ZTF Music Academy',
    source: 'ztf',
  },
  drums: {
    base: 'course-drums',
    width: 760,
    height: 505,
    alt: 'Batterie et percussions à la ZTF Music Academy',
    source: 'ztf',
  },
  studioDesk: {
    base: 'feature-1',
    width: 960,
    height: 1280,
    alt: 'En studio à la ZTF Music Academy',
    source: 'ztf',
  },
  score: {
    base: 'gallery-ear',
    width: 1280,
    height: 960,
    alt: "Formation de l'oreille musicale",
    source: 'ztf',
  },
  classroom: {
    base: 'hero-1',
    width: 520,
    height: 390,
    alt: 'Cours de clavier en classe à la ZTF Music Academy',
    source: 'ztf',
  },
  ensemble: {
    base: 'gallery-creativity',
    width: 1280,
    height: 960,
    alt: 'Ensemble musical à la ZTF Music Academy',
    source: 'ztf',
  },
  campus: {
    base: 'about-large',
    width: 1280,
    height: 960,
    alt: 'La ZTF Music Academy',
    source: 'ztf',
  },
  facultyPortrait: {
    base: 'faculty-portrait',
    width: 800,
    height: 800,
    alt: "Portrait d'un enseignant de la ZTF Music Academy",
    source: 'ztf-pending',
  },
} as const satisfies Record<string, ImageEntry>

export type ImageKey = keyof typeof IMAGES
