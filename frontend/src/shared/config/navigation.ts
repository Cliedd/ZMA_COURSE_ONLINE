/** Structure du méga-menu. Chaque entrée pointe vers un catalogue filtré et partageable.
 *
 * `value` est la valeur littérale envoyée au backend (`?department=…` / `?level=…`) et
 * stockée sur les fiches cours réelles — elle ne doit JAMAIS être traduite ni modifiée.
 * `labelKey`/`hintKey` sont des clés i18n (voir en.json/fr.json) qui pilotent uniquement
 * l'affichage. Ce découpage évite qu'une traduction casse silencieusement le filtrage. */

export interface NavEntry {
  value: string
  labelKey: string
  hintKey: string
  to: string
}

export const DEPARTMENTS: NavEntry[] = [
  {
    value: 'Performance & Instrumental Practice',
    labelKey: 'nav.departments.interpretation',
    hintKey: 'nav.departmentHints.interpretation',
    to: `/catalogue?department=${encodeURIComponent('Performance & Instrumental Practice')}`,
  },
  {
    value: 'Composition, Writing & Music Theory',
    labelKey: 'nav.departments.composition',
    hintKey: 'nav.departmentHints.composition',
    to: `/catalogue?department=${encodeURIComponent('Composition, Writing & Music Theory')}`,
  },
  {
    value: 'Music Technology & Audiovisual Production',
    labelKey: 'nav.departments.technologies',
    hintKey: 'nav.departmentHints.technologies',
    to: `/catalogue?department=${encodeURIComponent('Music Technology & Audiovisual Production')}`,
  },
  {
    value: 'Music Education & Teacher Training',
    labelKey: 'nav.departments.pedagogie',
    hintKey: 'nav.departmentHints.pedagogie',
    to: `/catalogue?department=${encodeURIComponent('Music Education & Teacher Training')}`,
  },
  {
    value: 'Musicology, Heritage & Cultural Management',
    labelKey: 'nav.departments.musicologie',
    hintKey: 'nav.departmentHints.musicologie',
    to: `/catalogue?department=${encodeURIComponent('Musicology, Heritage & Cultural Management')}`,
  },
]

export const LEVELS: NavEntry[] = [
  { value: "Bachelor's", labelKey: 'level.Licence', hintKey: 'nav.levelHints.licence', to: `/catalogue?level=${encodeURIComponent("Bachelor's")}` },
  { value: "Master's", labelKey: 'level.Master', hintKey: 'nav.levelHints.master', to: `/catalogue?level=${encodeURIComponent("Master's")}` },
  { value: 'Doctorate', labelKey: 'level.Doctorat', hintKey: 'nav.levelHints.doctorat', to: '/catalogue?level=Doctorate' },
  { value: 'Certificate', labelKey: 'level.Certificat', hintKey: 'nav.levelHints.certificat', to: '/catalogue?level=Certificate' },
  { value: 'Workshop', labelKey: 'level.Atelier', hintKey: 'nav.levelHints.atelier', to: '/catalogue?level=Workshop' },
]

/** Traduit le nom d'affichage d'un département à partir de sa valeur littérale (celle
 * stockée sur les fiches cours). Retombe sur la valeur brute si elle est inconnue —
 * ne casse jamais l'affichage même si des données legacy sortent de la taxonomie. */
export function departmentLabel(t: (key: string) => string, value?: string | null): string {
  if (!value) return ''
  const entry = DEPARTMENTS.find((d) => d.value === value)
  return entry ? t(entry.labelKey) : value
}

/** Même principe que `departmentLabel`, pour le niveau académique. */
export function levelLabel(t: (key: string) => string, value?: string | null): string {
  if (!value) return ''
  const entry = LEVELS.find((l) => l.value === value)
  return entry ? t(entry.labelKey) : value
}
