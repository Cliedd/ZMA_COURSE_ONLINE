import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, XCircle, AlertTriangle, Info, Loader2, RotateCcw } from 'lucide-react'
import { useQuizByLesson, useMyQuizAttempts, useSubmitQuizAttempt } from '../../../hooks/useQuiz'

export function QuizPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const { data: quiz, isLoading: quizLoading } = useQuizByLesson(lessonId)
  const { data: attempts = [], isLoading: attemptsLoading } = useMyQuizAttempts(quiz?.id)
  const submitAttempt = useSubmitQuizAttempt(quiz?.id)

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; passed: boolean; attemptNumber: number } | null>(null)

  const isLoading = quizLoading || attemptsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Aucun quiz disponible pour cette leçon.</p>
      </div>
    )
  }

  const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : undefined
  const isExam = quiz.mode === 'EXAM'
  const alreadyDoneExam = isExam && lastAttempt !== undefined

  // Already done EXAM — show result
  if (alreadyDoneExam && lastAttempt) {
    return (
      <div className="container py-16 max-w-xl text-center">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full mb-4 ${lastAttempt.passed ? 'bg-success/10' : 'bg-destructive/10'}`}>
          {lastAttempt.passed
            ? <CheckCircle className="h-8 w-8 text-success" />
            : <XCircle className="h-8 w-8 text-destructive" />}
        </div>
        <h1 className="font-serif text-2xl text-ink mb-2">{lastAttempt.passed ? 'Examen réussi !' : 'Examen non réussi'}</h1>
        <p className="text-muted-foreground mb-4">Vous avez déjà passé cet examen. Score obtenu : <strong>{lastAttempt.score}%</strong></p>
        <p className="text-sm text-muted-foreground">Cet examen de passage ne peut être tenté qu'une seule fois.</p>
      </div>
    )
  }

  // Show result after submission
  if (submitted && result) {
    return (
      <div className="container py-12 max-w-2xl">
        <div className="text-center mb-8">
          <div className={`inline-flex h-16 w-16 items-center justify-center rounded-full mb-4 ${result.passed ? 'bg-success/10' : 'bg-destructive/10'}`}>
            {result.passed
              ? <CheckCircle className="h-8 w-8 text-success" />
              : <XCircle className="h-8 w-8 text-destructive" />}
          </div>
          <h1 className="font-serif text-2xl text-ink mb-2">
            {result.passed ? 'Bravo, vous avez réussi !' : 'Score insuffisant'}
          </h1>
          <p className="text-muted-foreground">
            Score : <strong>{result.score}%</strong> — Seuil de réussite : <strong>{quiz.passingScore}%</strong>
          </p>
          {result.attemptNumber > 1 && (
            <p className="text-xs text-muted-foreground mt-1">Tentative n°{result.attemptNumber}</p>
          )}
        </div>

        {!isExam && !result.passed && (
          <div className="text-center">
            <button
              onClick={() => { setSubmitted(false); setAnswers({}); setResult(null) }}
              className="inline-flex items-center gap-2 rounded bg-ink px-6 py-2.5 text-sm font-semibold text-paper"
            >
              <RotateCcw className="h-4 w-4" /> Réessayer
            </button>
          </div>
        )}
      </div>
    )
  }

  // Quiz form
  const handleSubmit = async () => {
    const payload = {
      answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      })),
    }
    const attempt = await submitAttempt.mutateAsync(payload)
    setResult({ score: attempt.score, passed: attempt.passed, attemptNumber: attempt.attemptNumber })
    setSubmitted(true)
  }

  const allAnswered = quiz.questions.every(q => answers[q.id])

  return (
    <div className="container py-8 max-w-2xl">
      <h1 className="font-serif text-2xl text-ink mb-2">{quiz.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">{quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''}</p>

      {/* Mode banner */}
      {isExam ? (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 mb-8">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">
            <strong>Attention —</strong> Vous ne pouvez passer cet examen qu'une seule fois. Prenez le temps de vous concentrer avant de commencer.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 mb-8">
          <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-warning">
            Vous pouvez reprendre cet examen autant de fois que nécessaire jusqu'à ce que vous réussissiez. Il s'agit d'un examen de test pour consolider vos apprentissages.
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="border border-border rounded-lg p-5">
            <p className="font-medium text-sm mb-4">
              <span className="text-muted-foreground mr-2">Q{qi + 1}.</span>
              {q.questionText}
            </p>
            <div className="space-y-2">
              {q.options.map(o => (
                <label
                  key={o.id}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 cursor-pointer transition-colors ${
                    answers[q.id] === o.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={o.id}
                    checked={answers[q.id] === o.id}
                    onChange={() => setAnswers(prev => ({ ...prev, [q.id]: o.id }))}
                    className="accent-primary"
                  />
                  <span className="text-sm">{o.optionText}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitAttempt.isPending}
          className="flex items-center gap-2 rounded bg-ink px-8 py-3 text-sm font-semibold text-paper disabled:opacity-50"
        >
          {submitAttempt.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Soumettre mes réponses
        </button>
      </div>

      {!allAnswered && (
        <p className="text-center text-xs text-muted-foreground mt-3">
          Répondez à toutes les questions pour pouvoir soumettre.
        </p>
      )}
    </div>
  )
}
