import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, Loader2, BookOpen, DollarSign, Pencil } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { useCreateCourse } from '../../hooks/useCourses'
import { cn } from '../../lib/utils'

// Only 2 real steps — structure/video editing happens in the full CourseEditor
const steps = [
  { id: 1, label: 'Informations', icon: BookOpen, desc: 'Titre et description' },
  { id: 2, label: 'Tarification', icon: DollarSign, desc: 'Prix du cours' },
]

export const CourseWizard = () => {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  const createCourse = useCreateCourse()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(null)
    if (!title.trim()) { setError('Le titre est obligatoire.'); return }
    if (price === '' || Number(price) < 0) { setError('Veuillez saisir un prix valide (0 = gratuit).'); return }
    try {
      const course = await createCourse.mutateAsync({ title, description, price: Number(price) })
      // Redirect directly to the full editor so the teacher can set up sections, videos, etc.
      navigate(`/teacher/cours/${course.id}`)
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Erreur lors de la création du cours.')
    }
  }

  const canProceed = () => {
    if (step === 1) return title.trim().length > 0
    if (step === 2) return price !== '' && Number(price) >= 0
    return true
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Créer un nouveau cours</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Donnez un titre et un prix, puis vous configurerez tout le reste dans l'éditeur complet.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all text-sm font-semibold",
                step > s.id
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : step === s.id
                    ? "border-primary bg-primary text-white"
                    : "border-border text-muted-foreground bg-background"
              )}>
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <div className="text-center hidden sm:block">
                <p className={cn("text-xs font-medium", step === s.id ? "text-primary" : "text-muted-foreground")}>
                  {s.label}
                </p>
                <p className="text-[10px] text-muted-foreground/70">{s.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2 mb-5 transition-colors", step > s.id ? "bg-emerald-500" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

        <div className="px-8 py-6 border-b border-border bg-muted/20 flex items-center gap-3">
          {(() => { const s = steps[step - 1] ?? steps[0]!; const Icon = s.icon; return <Icon className="h-4 w-4 text-primary" /> })()}
          <div>
            <p className="text-sm font-semibold">{(steps[step - 1] ?? steps[0]!).label}</p>
            <p className="text-xs text-muted-foreground">{(steps[step - 1] ?? steps[0]!).desc}</p>
          </div>
          <Badge variant="muted" className="ml-auto text-[10px]">Étape {step}/2</Badge>
        </div>

        <div className="px-8 py-8 min-h-[260px]">
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du cours <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="ex : Jazz Harmony Fundamentals"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Choisissez un titre clair et accrocheur — c'est la première chose que vos étudiants verront.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                <textarea
                  id="desc"
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary transition-colors resize-none h-28"
                  placeholder="Décrivez ce que les étudiants vont apprendre..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Vous pourrez compléter la description complète dans l'éditeur.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="price">Prix en euros <span className="text-destructive">*</span></Label>
                <div className="relative w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">€</span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="49"
                    min={0}
                    max={500}
                    className="pl-8 h-11"
                    value={price}
                    onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Entrez 0 pour un cours gratuit. Vous pourrez modifier le prix depuis l'éditeur.</p>
              </div>

              <Separator />

              <div className="rounded-xl bg-muted/50 border border-border p-4 space-y-2.5 text-sm">
                <p className="font-semibold text-foreground">Récapitulatif</p>
                <div className="flex justify-between text-muted-foreground">
                  <span>Titre</span>
                  <span className="font-medium text-foreground truncate max-w-[200px]">{title || '—'}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Prix</span>
                  <span className="font-medium text-foreground">
                    {price === '' ? '—' : price === 0 ? 'Gratuit' : `${price}€`}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Étape suivante</span>
                  <span className="flex items-center gap-1 text-primary font-medium text-xs">
                    <Pencil className="h-3 w-3" /> Éditeur complet
                  </span>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3.5 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-8 py-5 border-t border-border bg-muted/10 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={step === 1}
            onClick={() => setStep(s => s - 1)}
          >
            Précédent
          </Button>

          <Button
            disabled={!canProceed() || createCourse.isPending}
            onClick={() => step === 2 ? handleSubmit() : setStep(s => s + 1)}
            className="gap-2 min-w-[160px]"
          >
            {step === 2
              ? createCourse.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Création...</>
                : <><Pencil className="h-4 w-4" /> Créer et éditer</>
              : <>Continuer <ChevronRight className="h-4 w-4" /></>
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
