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
    value: 'Interprétation',
    labelKey: 'nav.departments.interpretation',
    hintKey: 'nav.departmentHints.interpretation',
    to: `/catalogue?department=${encodeURIComponent('Interprétation')}`,
  },
  {
    value: 'Composition',
    labelKey: 'nav.departments.composition',
    hintKey: 'nav.departmentHints.composition',
    to: '/catalogue?department=Composition',
  },
  {
    value: 'Technologies',
    labelKey: 'nav.departments.technologies',
    hintKey: 'nav.departmentHints.technologies',
    to: '/catalogue?department=Technologies',
  },
  {
    value: 'Pédagogie',
    labelKey: 'nav.departments.pedagogie',
    hintKey: 'nav.departmentHints.pedagogie',
    to: `/catalogue?department=${encodeURIComponent('Pédagogie')}`,
  },
  {
    value: 'Musicologie',
    labelKey: 'nav.departments.musicologie',
    hintKey: 'nav.departmentHints.musicologie',
    to: '/catalogue?department=Musicologie',
  },
]

export const LEVELS: NavEntry[] = [
  { value: 'Licence', labelKey: 'level.Licence', hintKey: 'nav.levelHints.licence', to: '/catalogue?level=Licence' },
  { value: 'Master', labelKey: 'level.Master', hintKey: 'nav.levelHints.master', to: '/catalogue?level=Master' },
  { value: 'Doctorat', labelKey: 'level.Doctorat', hintKey: 'nav.levelHints.doctorat', to: '/catalogue?level=Doctorat' },
  { value: 'Certificat', labelKey: 'level.Certificat', hintKey: 'nav.levelHints.certificat', to: '/catalogue?level=Certificat' },
  { value: 'Atelier', labelKey: 'level.Atelier', hintKey: 'nav.levelHints.atelier', to: '/catalogue?level=Atelier' },
]

/** Traduit le nom d'affichage d'un département à partir de sa valeur littérale (celle
 * stockée sur les fiches cours). Retombe sur la valeur brute si elle est inconnue —
 * ne casse jamais l'affichage même si des données legacy sortent de la taxonomie. */
export function departmentLabel(t: (key: string) => string, value?: string | null): string {
  if (!value) return ''
  const entry = DEPARTMENTS.find((d) => d.value === value)
  return entry ? t(entry.labelKey) : value
}
