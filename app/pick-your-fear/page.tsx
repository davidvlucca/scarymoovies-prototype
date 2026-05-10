'use client'
import { useState, useTransition } from 'react'
import { QUESTIONS } from '@/lib/pyf/questions'
import type { Answer } from '@/lib/pyf/questions'
import { scoreAnswers } from '@/lib/pyf/scoring'
import { getRecommendations } from '@/lib/pyf/recommend'
import { QuizStep } from '@/components/pyf/quiz-step'
import { ResultScreen } from '@/components/pyf/result-screen'
import type { films } from '@/db/schema'

type Film = typeof films.$inferSelect
type Phase = 'quiz' | 'loading' | 'results'

export default function PickYourFearPage() {
  const [introShown, setIntroShown] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [phase, setPhase] = useState<Phase>('quiz')
  const [recommendations, setRecommendations] = useState<Film[]>([])
  const [, startTransition] = useTransition()

  const currentQuestion = QUESTIONS[step]

  function handleAnswer(answer: Answer) {
    const updatedAnswers = [...answers, answer]
    const isLast = step === QUESTIONS.length - 1

    if (isLast) {
      setAnswers(updatedAnswers)
      setPhase('loading')
      startTransition(async () => {
        const scores = scoreAnswers(updatedAnswers)
        const films = await getRecommendations(scores)
        setRecommendations(films)
        setPhase('results')
      })
    } else {
      setAnswers(updatedAnswers)
      setStep(step + 1)
    }
  }

  function handleRetake() {
    setStep(0)
    setAnswers([])
    setRecommendations([])
    setPhase('quiz')
    setIntroShown(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16 md:py-24">
      <div className="w-full max-w-lg flex flex-col gap-12">

        {/* Intro screen — shown before quiz begins */}
        {!introShown && (
          <div className="flex flex-col items-center gap-8 text-center">
            <p className="text-xs uppercase tracking-widest text-text-muted">Diagnostic</p>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-text-primary">
              Pick Your Fear
            </h1>
            <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
              Answer 4 questions. Discover your horror profile.
            </p>
            <button
              type="button"
              onClick={() => setIntroShown(true)}
              className="inline-flex items-center px-8 py-3 rounded-md bg-accent text-text-primary font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
            >
              Begin
            </button>
          </div>
        )}

        {/* Quiz state machine — only after intro */}
        {introShown && (
          <>
            {/* Page header */}
            <div className="flex flex-col gap-3 text-center">
              <p className="text-xs uppercase tracking-widest text-text-muted">Diagnostic</p>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-text-primary">
                Pick Your Fear
              </h1>
            </div>

            {phase === 'quiz' && currentQuestion && (
              <QuizStep
                question={currentQuestion}
                questionNumber={step + 1}
                totalQuestions={QUESTIONS.length}
                onAnswer={handleAnswer}
              />
            )}

            {phase === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <p className="text-text-muted text-xs uppercase tracking-widest">
                  Consulting the darkness&hellip;
                </p>
              </div>
            )}

            {phase === 'results' && (
              <ResultScreen films={recommendations} onRetake={handleRetake} />
            )}
          </>
        )}

      </div>
    </div>
  )
}
