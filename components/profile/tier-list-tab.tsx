'use client'

import { TierRow } from '@/components/ui/tier-row'

type TierEntry = {
  id: number
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
  position: number
  film_id: number
  film: {
    id: number
    tmdb_id: number
    title: string
    poster_path: string | null
    year: number | null
    genre: string | null
  }
}

type Props = {
  entries: TierEntry[]
  isOwner: boolean
}

const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'] as const

export function TierListTab({ entries, isOwner }: Props) {
  return (
    <div className="rounded-md overflow-hidden border border-border-subtle">
      {TIERS.map((tier) => {
        const tierEntries = entries.filter((e) => e.tier === tier)
        return (
          <TierRow
            key={tier}
            tier={tier}
            entries={tierEntries}
            isOwner={isOwner}
          />
        )
      })}
    </div>
  )
}
