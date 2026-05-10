'use client'

const MOODS = [
  { id: 'supernatural', label: 'Supernatural', genres: ['Horror'] },
  { id: 'slasher',       label: 'Slasher',       genres: ['Slasher', 'Horror'] },
  { id: 'psychological', label: 'Psychological',  genres: ['Thriller', 'Psychological Horror'] },
  { id: 'atmospheric',   label: 'Atmospheric',    genres: ['Mystery', 'Horror'] },
  { id: 'brutal',        label: 'Brutal',         genres: ['Horror', 'Action'] },
] as const

interface Props {
  selected: string | null
  onChange: (m: string | null) => void
}

export function getMoodGenres(moodId: string | null): string[] | null {
  if (moodId === null) return null
  const mood = MOODS.find((m) => m.id === moodId)
  return mood ? [...mood.genres] : null
}

export function MoodFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs uppercase tracking-widest text-text-muted">Mood</p>
      <div className="flex flex-wrap gap-2">
        {/* All option */}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={[
            'px-3 py-1 rounded-full text-xs uppercase tracking-wide transition-all duration-200 bg-bg-surface',
            selected === null ? 'opacity-100 text-text-primary' : 'opacity-50 text-text-secondary hover:opacity-75',
          ].join(' ')}
        >
          All
        </button>

        {MOODS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => onChange(mood.id === selected ? null : mood.id)}
            className={[
              'px-3 py-1 rounded-full text-xs uppercase tracking-wide transition-all duration-200 bg-bg-surface',
              selected === mood.id ? 'opacity-100 text-text-primary' : 'opacity-50 text-text-secondary hover:opacity-75',
            ].join(' ')}
          >
            {mood.label}
          </button>
        ))}
      </div>
    </div>
  )
}
