/**
 * Encode les sources de public/images/_source/ vers les 4 largeurs et 3 formats
 * attendus par src/design/primitives/picture.tsx.
 *
 * Applique l'étalonnage commun décrit au spec § 9.2 : légère dominante chaude
 * et contraste homogène. C'est cette étape qui empêche 40 photos de 40
 * photographes de ressembler à un patchwork.
 *
 * Usage : npm run images:encode
 */
import { readdir, mkdir } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const SOURCE_DIR = 'public/images/_source'
const OUTPUT_DIR = 'public/images'
const WIDTHS = [400, 800, 1200, 1600]

/** Étalonnage commun — ne pas modifier sans revoir l'ensemble de la photothèque. */
function grade(pipeline) {
  return pipeline
    .modulate({ saturation: 0.98, brightness: 1.02 })
    .linear(1.06, -8)
    .composite([
      {
        input: {
          create: {
            width: 4,
            height: 4,
            channels: 4,
            background: { r: 255, g: 250, b: 242, alpha: 0.12 },
          },
        },
        blend: 'soft-light',
        tile: true,
      },
    ])
}

await mkdir(OUTPUT_DIR, { recursive: true })
const files = (await readdir(SOURCE_DIR)).filter((f) => /\.(jpe?g|png|tiff?)$/i.test(f))

if (files.length === 0) {
  console.error(`Aucune source dans ${SOURCE_DIR}. Y déposer les originaux nommés d'après manifest.ts (ex. hero-stage.jpg).`)
  process.exit(1)
}

for (const file of files) {
  const { name } = parse(file)
  for (const width of WIDTHS) {
    const base = grade(sharp(join(SOURCE_DIR, file)).resize({ width, withoutEnlargement: true }))
    await base.clone().avif({ quality: 55, effort: 6 }).toFile(join(OUTPUT_DIR, `${name}-${width}.avif`))
    await base.clone().webp({ quality: 72 }).toFile(join(OUTPUT_DIR, `${name}-${width}.webp`))
    await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(join(OUTPUT_DIR, `${name}-${width}.jpg`))
  }
  console.log(`✓ ${name} — ${WIDTHS.length * 3} fichiers`)
}
