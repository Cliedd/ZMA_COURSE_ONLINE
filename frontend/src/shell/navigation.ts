/** Structure du méga-menu. Chaque entrée pointe vers un catalogue filtré et partageable. */

export interface NavEntry {
  label: string
  hint: string
  to: string
}

export const DEPARTMENTS: NavEntry[] = [
  { label: 'Interprétation', hint: 'Piano · Guitare · Jazz · Chant', to: `/catalogue?department=${encodeURIComponent('Interprétation')}` },
  { label: 'Composition', hint: 'Écriture · Orchestration', to: '/catalogue?department=Composition' },
  { label: 'Technologies', hint: 'Production · Studio · Audio', to: '/catalogue?department=Technologies' },
  { label: 'Pédagogie', hint: 'Formation des formateurs', to: `/catalogue?department=${encodeURIComponent('Pédagogie')}` },
  { label: 'Musicologie', hint: 'Patrimoine · Management', to: '/catalogue?department=Musicologie' },
]

export const LEVELS: NavEntry[] = [
  { label: 'Licence', hint: '180 ECTS · 3 ans', to: '/catalogue?level=Licence' },
  { label: 'Master', hint: '120 ECTS · 2 ans', to: '/catalogue?level=Master' },
  { label: 'Doctorat', hint: '3 ans', to: '/catalogue?level=Doctorat' },
  { label: 'Certificat', hint: '8 à 16 semaines', to: '/catalogue?level=Certificat' },
  { label: 'Atelier', hint: 'Court · sans prérequis', to: '/catalogue?level=Atelier' },
]
