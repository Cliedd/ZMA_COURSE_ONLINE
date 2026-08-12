export type QuizMode = 'TRAINING' | 'EXAM'

export interface QuizOption {
  id: string
  optionText: string
  correct: boolean
  positionOrder: number
}

export interface QuizQuestion {
  id: string
  questionText: string
  positionOrder: number
  options: QuizOption[]
}

export interface Quiz {
  id: string
  lessonId: string
  title: string
  mode: QuizMode
  passingScore: number
  questions: QuizQuestion[]
}

export interface QuizAttempt {
  id: string
  quizId: string
  studentEmail: string
  score: number
  passed: boolean
  attemptNumber: number
  completedAt: string
  answers?: QuizAttemptAnswer[]
}

export interface QuizAttemptAnswer {
  id: string
  questionId: string
  selectedOptionId: string
  correct: boolean
}

export interface QuizStats {
  totalAttempts: number
  passedFirst: number
  failed: number
  avgScore: number
}

export interface SubmitAttemptPayload {
  answers: { questionId: string; selectedOptionId: string }[]
}

export interface QuizRequest {
  title: string
  mode: QuizMode
  passingScore: number
  questions: {
    questionText: string
    positionOrder: number
    options: {
      optionText: string
      correct: boolean
      positionOrder: number
    }[]
  }[]
}
