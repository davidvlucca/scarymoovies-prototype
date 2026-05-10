'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { addToTierList } from '@/app/actions/tier-list'

const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'] as const
type Tier = (typeof TIERS)[number]

const TIER_COLORS: Record<Tier, string> = {
  S: 'var(--tier-s)',
  A: 'var(--tier-a)',
  B: 'var(--tier-b)',
  C: 'var(--tier-c)',
  D: 'var(--tier-d)',
  E: 'var(--tier-e)',
  F: 'var(--tier-f)',
}

type Props = {
  filmId: number
  initialTier: Tier | null
  hasRating: boolean
}

export function TierPicker({ filmId, initialTier, hasRating }: Props) {
  const [currentTier, setCurrentTier] = useState<Tier | null>(initialTier)
  const [isPending, startTransition] = useTransition()

  function handleTier(tier: Tier) {
    startTransition(async () => {
      const result = await addToTierList(filmId, tier)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setCurrentTier(tier)
        toast.success(`Moved to tier ${tier}.`)
      }
    })
  }

  return (
    <div className="rounded-lg border border-border-subtle p-4 md:p-5 space-y-4 bg-bg-surface">
      <div>
        <p className="text-xs uppercase tracking-widest mb-1 text-text-muted">
          Tier List
        </p>
        {currentTier ? (
          <p className="text-2xl font-black text-accent">
            {currentTier}
            <span className="text-sm font-normal ml-1 text-text-muted">Tier</span>
          </p>
        ) : (
          <p className="text-sm text-text-secondary">
            {hasRating ? 'Pick a tier' : 'Rate first to tier this film'}
          </p>
        )}
      </div>

      <div className="flex gap-1.5">
        {TIERS.map((tier) => {
          const isSelected = currentTier === tier
          return (
            <button
              key={tier}
              type="button"
              disabled={!hasRating || isPending}
              onClick={() => handleTier(tier)}
              aria-label={`Set tier ${tier}`}
              aria-pressed={isSelected}
              style={
                isSelected
                  ? { backgroundColor: TIER_COLORS[tier], borderColor: TIER_COLORS[tier] }
                  : undefined
              }
              className={[
                'flex-1 h-9 rounded text-sm font-bold border transition-all duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'focus-visible:outline-none focus-visible:ring-2',
                isSelected
                  ? 'text-white'
                  : 'bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {tier}
            </button>
          )
        })}
      </div>

      {isPending && (
        <p className="text-xs text-text-muted">Saving…</p>
      )}
    </div>
  )
}
