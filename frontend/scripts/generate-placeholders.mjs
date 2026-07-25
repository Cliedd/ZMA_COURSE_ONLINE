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

// Registre scène (cohérent avec app/styles/tokens.css). Chaque visuel reçoit
// une teinte chaude légèrement différente pour rester distinct sans rompre l'unité.
const SPECS = [
  { base: 'hero-stage', w: 1600, h: 900, tint: '#3A2A10', label: 'Scène' },
  { base: 'piano-hands', w: 1200, h: 750, tint: '#2E5286', label: 'Piano' },
  { base: 'studio-desk', w: 1200, h: 750, tint: '#1F5A4E', label: 'Studio' },
  { base: 'strings', w: 1200, h: 750, tint: '#7A5A20', label: 'Cordes' },
  { base: 'score', w: 1200, h: 750, tint: '#5A3A70', label: 'Partition' },
]

const INK = '#0A0E14'
const GOLD = '#C8960C'

/** SVG : dégradé radial sombre → teinte, glyphe de note translucide, étiquette or. */
function svg({ w, h, tint, label }) {
  const cx = Math.round(w * 0.72)
  const noteSize = Math.round(h * 0.5)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="g" cx="72%" cy="26%" r="90%">
      <stop offset="0%" stop-color="${tint}"/>
      <stop offset="48%" stop-color="${INK}"/>
      <stop offset="100%" stop-color="${INK}"/>
    </radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <polygon points="${cx - w * 0.18},0 ${cx + w * 0.18},0 ${cx + w * 0.05},${h} ${cx - w * 0.3},${h}" fill="url(#beam)"/>
  <g transform="translate(${cx}, ${Math.round(h * 0.4)})" fill="${GOLD}" fill-opacity="0.10">
    <path d="M ${noteSize * 0.28} ${-noteSize * 0.5} L ${noteSize * 0.28} ${noteSize * 0.28}
      a ${noteSize * 0.16} ${noteSize * 0.13} 0 1 1 -${noteSize * 0.06} -${noteSize * 0.12}
      L ${noteSize * 0.16} ${-noteSize * 0.38} Z"/>
  </g>
  <text x="${Math.round(w * 0.06)}" y="${Math.round(h * 0.86)}"
    font-family="Georgia, serif" font-size="${Math.round(h * 0.11)}" fill="#F2EFE9" fill-opacity="0.92">${label}</text>
  <text x="${Math.round(w * 0.06)}" y="${Math.round(h * 0.94)}"
    font-family="Inter, sans-serif" font-size="${Math.round(h * 0.028)}" letter-spacing="3"
    fill="${GOLD}" fill-opacity="0.75">PLACEHOLDER — À REMPLACER PAR UNE PHOTO RÉELLE</text>
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
