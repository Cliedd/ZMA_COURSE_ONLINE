import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Plus, Trash2, ChevronUp, ChevronDown, Save, Loader2, ChevronLeft } from 'lucide-react'
import { useQuizByLesson, useCreateOrUpdateQuiz, useDeleteQuiz } from '../../../hooks/useQuiz'
import type { QuizMode, QuizRequest } from '../../../types/quiz'

interface LocalOption {
  optionText: string
  correct: boolean
}

interface LocalQuestion {
  questionText: string
  options: LocalOption[]
}

export function QuizEditorPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()

  const { data: existingQuiz, isLoading } = useQuizByLesson(lessonId)
  const createOrUpdate = useCreateOrUpdateQuiz(lessonId!)
  const deleteQuiz = useDeleteQuiz()

  const [title, setTitle] = useState('')
  const [mode, setMode] = useState<QuizMode>('TRAINING')
  const [passingScore, setPassingScore] = useState(70)
  const [questions, setQuestions] = useState<LocalQuestion[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (existingQuiz) {
      setTitle(existingQuiz.title)
      setMode(existingQuiz.mode)
      setPassingScore(existingQuiz.passingScore)
      setQuestions(existingQuiz.questions.map(q => ({
        questionText: q.questionText,
        options: q.options.map(o => ({ optionText: o.optionText, correct: o.correct })),
      })))
    }
  }, [existingQuiz])

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      questionText: '',
      options: [{ optionText: '', correct: true }, { optionText: '', correct: false }],
    }])
  }

  const removeQuestion = (qi: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== qi))
  }

  const moveQuestion = (qi: number, dir: -1 | 1) => {
    const next = [...questions]
    const target = qi + dir
    if (target < 0 || target >= next.length) return
    const a = next[qi]
    const b = next[target]
    if (!a || !b) return
    next[qi] = b
    next[target] = a
    setQuestions(next)
  }

  const updateQuestion = (qi: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => i === qi ? { ...q, questionText: text } : q))
  }

  const addOption = (qi: number) => {
    setQuestions(prev => prev.map((q, i) => i === qi
      ? { ...q, options: [...q.options, { optionText: '', correct: false }] }
      : q))
  }

  const removeOption = (qi: number, oi: number) => {
    setQuestions(prev => prev.map((q, i) => i === qi
      ? { ...q, options: q.options.filter((_, j) => j !== oi) }
      : q))
  }

  const updateOption = (qi: number, oi: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => i === qi
      ? { ...q, options: q.options.map((o, j) => j === oi ? { ...o, optionText: text } : o) }
      : q))
  }

  const setCorrectOption = (qi: number, oi: number) => {
    setQuestions(prev => prev.map((q, i) => i === qi
      ? { ...q, options: q.options.map((o, j) => ({ ...o, correct: j === oi })) }
      : q))
  }

  const handleSave = async () => {
    const payload: QuizRequest = {
      title,
      mode,
      passingScore,
      questions: questions.map((q, qi) => ({
        questionText: q.questionText,
        positionOrder: qi,
        options: q.options.map((o, oi) => ({
          optionText: o.optionText,
          correct: o.correct,
          positionOrder: oi,
        })),
      })),
    }
    await createOrUpdate.mutateAsync(payload)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDelete = async () => {
    if (!existingQuiz) return
    if (!confirm('Supprimer ce quiz ? Cette action est irréversible.')) return
    await deleteQuiz.mutateAsync({ quizId: existingQuiz.id, lessonId: lessonId! })
    navigate(`/teacher/courses/${courseId}/edit`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <Link to={`/teacher/courses/${courseId}/edit`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />
        Retour au cours
      </Link>

      <h1 className="font-serif text-2xl text-ink mb-2">
        {existingQuiz ? 'Modifier le quiz' : 'Créer un quiz'}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">Leçon : {lessonId}</p>

      {/* Titre */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Titre du quiz</label>
        <input
          className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ex : Quiz de fin de module 1"
        />
      </div>

      {/* Mode */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Type d'examen</label>
        <div className="flex gap-3">
          <button
            onClick={() => setMode('TRAINING')}
            className={`flex-1 rounded border px-4 py-3 text-left text-sm transition-colors ${mode === 'TRAINING' ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}
          >
            <span className="font-semibold block">Examen de test</span>
            <span className="text-xs text-muted-foreground">Tentatives illimitées — les étudiants peuvent reprendre jusqu'à réussir</span>
          </button>
          <button
            onClick={() => setMode('EXAM')}
            className={`flex-1 rounded border px-4 py-3 text-left text-sm transition-colors ${mode === 'EXAM' ? 'border-destructive bg-destructive/5 text-destructive' : 'border-border'}`}
          >
            <span className="font-semibold block">Examen de passage</span>
            <span className="text-xs text-muted-foreground">Une seule tentative — évaluation définitive</span>
          </button>
        </div>
      </div>

      {/* Score de passage */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-1">Score minimum pour réussir ({passingScore}%)</label>
        <input
          type="range" min={10} max={100} step={5}
          value={passingScore}
          onChange={e => setPassingScore(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>10%</span><span>100%</span>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={qi} className="border border-border rounded-lg p-4 bg-surface">
            <div className="flex items-start gap-2 mb-3">
              <span className="shrink-0 text-xs font-bold text-muted-foreground pt-2">Q{qi + 1}</span>
              <textarea
                className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm resize-none"
                rows={2}
                value={q.questionText}
                onChange={e => updateQuestion(qi, e.target.value)}
                placeholder="Énoncé de la question..."
              />
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => moveQuestion(qi, -1)} className="rounded p-1 hover:bg-muted" title="Monter">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => moveQuestion(qi, 1)} className="rounded p-1 hover:bg-muted" title="Descendre">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => removeQuestion(qi)} className="rounded p-1 hover:bg-destructive/10 text-destructive" title="Supprimer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-2 pl-6">
              {q.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={o.correct}
                    onChange={() => setCorrectOption(qi, oi)}
                    className="shrink-0"
                    title="Bonne réponse"
                  />
                  <input
                    className="flex-1 rounded border border-border bg-background px-3 py-1.5 text-sm"
                    value={o.optionText}
                    onChange={e => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}...`}
                  />
                  {q.options.length > 2 && (
                    <button onClick={() => removeOption(qi, oi)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <button onClick={() => addOption(qi)} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                  <Plus className="h-3 w-3" /> Ajouter une option
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 pl-6">● = bonne réponse (cliquer le radio pour la sélectionner)</p>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="mt-4 flex items-center gap-2 rounded border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary w-full justify-center transition-colors"
      >
        <Plus className="h-4 w-4" /> Ajouter une question
      </button>

      {/* Actions */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        {existingQuiz ? (
          <button
            onClick={handleDelete}
            disabled={deleteQuiz.isPending}
            className="text-sm text-destructive hover:underline"
          >
            Supprimer le quiz
          </button>
        ) : <div />}
        <button
          onClick={handleSave}
          disabled={createOrUpdate.isPending || !title || questions.length === 0}
          className="flex items-center gap-2 rounded bg-ink px-6 py-2.5 text-sm font-semibold text-paper disabled:opacity-50"
        >
          {createOrUpdate.isPending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Save className="h-4 w-4" />}
          {saved ? 'Enregistré !' : 'Enregistrer le quiz'}
        </button>
      </div>
    </div>
  )
}
