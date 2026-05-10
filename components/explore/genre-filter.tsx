'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  genres: string[]
  selected: string | null
  onChange: (g: string | null) => void
}

export function GenreFilter({ genres, selected, onChange }: Props) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-muted hover:text-text-secondary transition-colors duration-150 w-fit"
        aria-expanded={expanded}
      >
        <span>Genre</span>
        <ChevronDown
          size={14}
          className="transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: expanded ? '200px' : '0',
          opacity: expanded ? 1 : 0,
          transition: 'max-height 300ms ease, opacity 200ms ease',
        }}
      >
        <div className="flex flex-wrap gap-2 pb-1">
          {/* All chip */}
          <button
            type="button"
            onClick={() => onChange(null)}
            className={[
              'px-3 py-1 rounded-full text-xs uppercase tracking-wide transition-colors duration-150',
              selected === null
                ? 'bg-accent text-text-primary'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            All
          </button>

          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => onChange(genre === selected ? null : genre)}
              className={[
                'px-3 py-1 rounded-full text-xs uppercase tracking-wide transition-colors duration-150',
                selected === genre
                  ? 'bg-accent text-text-primary'
                  : 'bg-bg-surface text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
