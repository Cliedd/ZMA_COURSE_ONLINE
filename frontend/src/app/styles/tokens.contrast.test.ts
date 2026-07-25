import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/** Lit tokens.css et en extrait les couples nom → valeur hexadécimale. */
function readTokens(selector: string): Record<string, string> {
  const css = readFileSync(resolve(__dirname, 'tokens.css'), 'utf8')
  const block = css.split(selector)[1]?.split('}')[0] ?? ''
  const tokens: Record<string, string> = {}
  for (const match of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    const [, name, value] = match
    if (name && value) tokens[name] = value
  }
  return tokens
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!
}

export function contrastRatio(a: string, b: string): number {
  const [high, low] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (high! + 0.05) / (low! + 0.05)
}

describe('jetons du registre clair', () => {
  const t = readTokens(':root')

  it('définit tous les jetons attendus', () => {
    for (const name of ['paper', 'surface', 'ink', 'ink-muted', 'ink-faint', 'line', 'blue', 'accent', 'accent-ink', 'success', 'warning', 'danger', 'info']) {
      expect(t[name], `jeton --${name} manquant`).toBeDefined()
    }
  })

  it.each([
    ['ink', 4.5],
    ['ink-muted', 4.5],
    ['blue', 4.5],
    ['accent-ink', 4.5],
    ['success', 4.5],
    ['warning', 4.5],
    ['danger', 4.5],
    ['info', 4.5],
  ])('--%s atteint le seuil AA texte normal (%s:1) sur --paper', (name, min) => {
    expect(contrastRatio(t[name]!, t['paper']!)).toBeGreaterThanOrEqual(min)
  })

  it('--ink-faint atteint le seuil gros texte (3:1) mais pas celui du texte normal', () => {
    const ratio = contrastRatio(t['ink-faint']!, t['paper']!)
    expect(ratio).toBeGreaterThanOrEqual(3)
    expect(ratio).toBeLessThan(4.5)
  })

  it('--accent (orange de marque) est réservé au décor et au gros texte, pas au corps', () => {
    // L'orange #E07000 passe le seuil des éléments non textuels / gros texte (3:1)
    // mais PAS celui du texte normal (4,5:1) : pour du texte, utiliser --accent-ink.
    const ratio = contrastRatio(t['accent']!, t['paper']!)
    expect(ratio).toBeGreaterThanOrEqual(3)
    expect(ratio).toBeLessThan(4.5)
  })

  it('--accent-ink reste lisible aussi sur --surface (blanc)', () => {
    expect(contrastRatio(t['accent-ink']!, t['surface']!)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('jetons du registre sombre', () => {
  const t = readTokens('[data-theme=\'dark\']')

  it.each([
    ['scene-ink', 4.5],
    ['accent', 4.5],
  ])('--%s atteint le seuil AA (%s:1) sur --scene', (name, min) => {
    expect(contrastRatio(t[name]!, t['scene']!)).toBeGreaterThanOrEqual(min)
  })
})
