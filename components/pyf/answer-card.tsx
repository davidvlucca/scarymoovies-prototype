'use client'
import type { Answer } from '@/lib/pyf/questions'

type Props = {
  answer: Answer
  onSelect: () => void
}

export function AnswerCard({ answer, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left px-5 py-4 rounded-md bg-bg-surface border border-border-subtle cursor-pointer transition-colors duration-150 hover:bg-bg-elevated hover:border-border group"
    >
      <span className="text-text-secondary text-sm leading-relaxed group-hover:text-text-primary transition-colors duration-150">
        {answer.text}
      </span>
    </button>
  )
}
