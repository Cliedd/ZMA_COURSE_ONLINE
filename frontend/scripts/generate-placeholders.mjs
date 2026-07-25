/**
 * Génère des PLACEHOLDERS de marque pour les entrées `source: 'stock'` du
 * manifeste, en attendant de vraies photos libres de droit.
 *
 * Ce ne sont PAS des photos : ce sont des visuels abstraits aux couleurs de la
 * marque (registre « scène » + or), aux dimensions exactes du manifeste, sans
 * aucun visage. Ils tiennent le CLS à zéro et rendent la mise en page présentable.
 * Pour les remplacer : déposer les vraies photos dans public/images/_source/
 * (même nom de base) puis `npm run images:encode`.
 *
 * Usage : npm run images:placeholders
 */
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const OUT = 'public/images/_source'

// SOBRIÉTÉ : tous les visuels dans le MÊME schéma navy + or (aucune teinte
// parasite). Seule varie la position de la lueur or, pour distinguer sans rompre
// l'unité. Cohérent avec app/styles/tokens.css (registre scène).
const INK = '#0A0E14'
const INK_2 = '#111826'
const GOLD = '#C8960C'

const SPECS = [
  { base: 'hero-stage', w: 1600, h: 900, gx: 72, gy: 22 },
  { base: 'piano-hands', w: 1200, h: 750, gx: 32, gy: 30 },
  { base: 'studio-desk', w: 1200, h: 750, gx: 60, gy: 68 },
  { base: 'strings', w: 1200, h: 750, gx: 78, gy: 40 },
  { base: 'score', w: 1200, h: 750, gx: 24, gy: 62 },
]

/** SVG sobre : dégradé navy, lueur or diffuse, fin galon or. Aucun texte, aucune autre couleur. */
function svg({ w, h, gx, gy }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${INK_2}"/>
      <stop offset="100%" stop-color="${INK}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${gx}%" cy="${gy}%" r="55%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.22"/>
      <stop offset="55%" stop-color="${GOLD}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#base)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect x="0" y="${h - Math.max(3, Math.round(h * 0.006))}" width="${w}" height="${Math.max(3, Math.round(h * 0.006))}" fill="${GOLD}" fill-opacity="0.55"/>
</svg>`
}

await mkdir(OUT, { recursive: true })
for (const spec of SPECS) {
  await sharp(Buffer.from(svg(spec)))
    .jpeg({ quality: 90 })
    .toFile(join(OUT, `${spec.base}.jpg`))
  console.log(`✓ ${spec.base}.jpg (${spec.w}×${spec.h})`)
}
console.log(`\n${SPECS.length} placeholders générés dans ${OUT}. Lancer « npm run images:encode ».`)
