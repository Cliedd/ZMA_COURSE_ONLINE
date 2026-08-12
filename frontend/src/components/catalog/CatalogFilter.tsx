import { SlidersHorizontal, X } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { cn } from '../../lib/utils'

const DEPARTMENTS = [
  'Performance & Instrumental Practice',
  'Composition, Writing & Music Theory',
  'Music Technology & Audiovisual Production',
  'Music Education & Teacher Training',
  'Musicology, Heritage & Cultural Management',
]

const DEPT_LABELS: Record<string, string> = {
  'Performance & Instrumental Practice': 'Interprétation',
  'Composition, Writing & Music Theory': 'Composition',
  'Music Technology & Audiovisual Production': 'Technologies musicales',
  'Music Education & Teacher Training': 'Pédagogie',
  'Musicology, Heritage & Cultural Management': 'Musicologie',
}

const LEVELS = ['Licence', 'Master', 'Doctorat', 'Certificat']

const PRICE_RANGES = [
  { label: 'Moins de 150 €', max: 150 },
  { label: '150 € – 350 €', min: 150, max: 350 },
  { label: '350 € – 500 €', min: 350, max: 500 },
  { label: 'Plus de 500 €', min: 500 },
]

export interface FilterState {
  departments: string[]
  levels: string[]
  priceRange: string | null
}

interface CatalogFilterProps {
  filters: FilterState
  onChange: (f: FilterState) => void
}

export const CatalogFilter = ({ filters, onChange }: CatalogFilterProps) => {
  const totalActive = filters.departments.length + filters.levels.length + (filters.priceRange ? 1 : 0)

  const toggleDept = (d: string) => {
    const next = filters.departments.includes(d)
      ? filters.departments.filter(x => x !== d)
      : [...filters.departments, d]
    onChange({ ...filters, departments: next })
  }

  const toggleLevel = (l: string) => {
    const next = filters.levels.includes(l)
      ? filters.levels.filter(x => x !== l)
      : [...filters.levels, l]
    onChange({ ...filters, levels: next })
  }

  const togglePrice = (label: string) =>
    onChange({ ...filters, priceRange: filters.priceRange === label ? null : label })

  const reset = () => onChange({ departments: [], levels: [], priceRange: null })

  return (
    <aside className="w-full md:w-60 shrink-0 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filtres
          {totalActive > 0 && (
            <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
              {totalActive}
            </Badge>
          )}
        </div>
        {totalActive > 0 && (
          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Effacer
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {totalActive > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.departments.map(d => (
            <Badge key={d} variant="default" className="gap-1 cursor-pointer text-[10px] pr-1.5" onClick={() => toggleDept(d)}>
              {DEPT_LABELS[d] ?? d} <X className="h-2.5 w-2.5" />
            </Badge>
          ))}
          {filters.levels.map(l => (
            <Badge key={l} variant="secondary" className="gap-1 cursor-pointer text-[10px] pr-1.5" onClick={() => toggleLevel(l)}>
              {l} <X className="h-2.5 w-2.5" />
            </Badge>
          ))}
          {filters.priceRange && (
            <Badge variant="outline" className="gap-1 cursor-pointer text-[10px] pr-1.5" onClick={() => togglePrice(filters.priceRange!)}>
              {filters.priceRange} <X className="h-2.5 w-2.5" />
            </Badge>
          )}
        </div>
      )}

      <Separator />

      <Accordion type="multiple" defaultValue={['dept', 'level', 'price']} className="space-y-0">

        {/* Departments */}
        <AccordionItem value="dept" className="border-none">
          <AccordionTrigger className="text-sm font-semibold py-2.5 px-0 hover:no-underline">
            Département
          </AccordionTrigger>
          <AccordionContent className="pb-1">
            <div className="space-y-1">
              {DEPARTMENTS.map(dept => (
                <button
                  key={dept}
                  onClick={() => toggleDept(dept)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                    filters.departments.includes(dept)
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {DEPT_LABELS[dept] ?? dept}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Level */}
        <AccordionItem value="level" className="border-none">
          <AccordionTrigger className="text-sm font-semibold py-2.5 px-0 hover:no-underline">
            Niveau
          </AccordionTrigger>
          <AccordionContent className="pb-1">
            <div className="space-y-1">
              {LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => toggleLevel(level)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                    filters.levels.includes(level)
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price */}
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="text-sm font-semibold py-2.5 px-0 hover:no-underline">
            Prix
          </AccordionTrigger>
          <AccordionContent className="pb-1">
            <div className="space-y-1">
              {PRICE_RANGES.map(({ label }) => (
                <button
                  key={label}
                  onClick={() => togglePrice(label)}
                  className={cn(
                    "w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                    filters.priceRange === label
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {totalActive > 0 && (
        <Button variant="outline" className="w-full" size="sm" onClick={reset}>
          Réinitialiser les filtres
        </Button>
      )}
    </aside>
  )
}
