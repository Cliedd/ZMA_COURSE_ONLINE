/**
 * Inventaire des visuels du site.
 *
 * `source: 'stock'`       — visuel de banque, étalonné, en place.
 * `source: 'ztf-pending'` — emplacement réservé au matériel photo réel de ZTF.
 *                           Tant qu'il est absent, la surface affiche un état
 *                           vide soigné plutôt qu'un visage de banque : un
 *                           portrait acheté ne peut pas illustrer un enseignant
 *                           nommé (spec § 9.2).
 *
 * Direction artistique (spec § 9.2) : le geste et l'instrument priment sur le
 * visage ; lumière dirigée ; aucune pose souriante face caméra.
 *
 * Les fichiers vivent dans public/images/<base>-<largeur>.<avif|webp|jpg>,
 * produits par `npm run images:encode`.
 */

export interface ImageEntry {
  /** Nom de base du fichier, sans largeur ni extension. */
  base: string
  /** Dimensions intrinsèques du plus grand rendu — nécessaires pour le CLS. */
  width: number
  height: number
  alt: string
  source: 'stock' | 'ztf-pending'
}

export const IMAGE_WIDTHS = [400, 800, 1200, 1600] as const

export const IMAGES = {
  heroStage: {
    base: 'hero-stage',
    width: 1600,
    height: 900,
    alt: 'Scène de concert en contre-jour, faisceaux de projecteurs',
    source: 'stock',
  },
  pianoHands: {
    base: 'piano-hands',
    width: 1200,
    height: 750,
    alt: 'Mains sur les touches d\'un piano à queue',
    source: 'stock',
  },
  studioDesk: {
    base: 'studio-desk',
    width: 1200,
    height: 750,
    alt: 'Console de mixage dans un studio d\'enregistrement',
    source: 'stock',
  },
  strings: {
    base: 'strings',
    width: 1200,
    height: 750,
    alt: 'Archets et cordes d\'un pupitre de violons',
    source: 'stock',
  },
  score: {
    base: 'score',
    width: 1200,
    height: 750,
    alt: 'Partition manuscrite et crayon',
    source: 'stock',
  },
  facultyPortrait: {
    base: 'faculty-portrait',
    width: 800,
    height: 800,
    alt: 'Portrait d\'un enseignant de la ZTF Music Académie',
    source: 'ztf-pending',
  },
  campus: {
    base: 'campus',
    width: 1600,
    height: 900,
    alt: 'Locaux de la ZTF Music Académie',
    source: 'ztf-pending',
  },
  graduation: {
    base: 'graduation',
    width: 1600,
    height: 900,
    alt: 'Cérémonie de remise des diplômes de la ZTF Music Académie',
    source: 'ztf-pending',
  },
} as const satisfies Record<string, ImageEntry>

export type ImageKey = keyof typeof IMAGES
