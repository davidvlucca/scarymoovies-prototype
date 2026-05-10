'use client'
import type { Question, Answer } from '@/lib/pyf/questions'
import { AnswerCard } from './answer-card'

type Props = {
  question: Question
  questionNumber: number
  totalQuestions: number
  onAnswer: (answer: Answer) => void
}

export function QuizStep({ question, questionNumber, totalQuestions, onAnswer }: Props) {
  const progressPct = Math.round(((questionNumber - 1) / totalQuestions) * 100)

  return (
    <div className="flex flex-col gap-8">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-text-muted">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-xs text-text-muted tabular-nums">
            {progressPct}%
          </span>
        </div>
        <div className="h-px w-full bg-bg-elevated overflow-hidden rounded-full">
          <div
            className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-text-primary leading-tight">
        {question.text}
      </h2>

      {/* Answers */}
      <div className="flex flex-col gap-3">
        {question.answers.map((answer) => (
          <AnswerCard
            key={answer.id}
            answer={answer}
            onSelect={() => onAnswer(answer)}
          />
        ))}
      </div>
    </div>
  )
}
