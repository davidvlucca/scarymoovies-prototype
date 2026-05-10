import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const FilmIdSchema = z.object({
  filmId: z.number().int().positive(),
})

describe('FilmIdSchema', () => {
  it('accepts a positive integer', () => {
    expect(FilmIdSchema.safeParse({ filmId: 42 }).success).toBe(true)
  })

  it('rejects 0', () => {
    expect(FilmIdSchema.safeParse({ filmId: 0 }).success).toBe(false)
  })

  it('rejects negative', () => {
    expect(FilmIdSchema.safeParse({ filmId: -1 }).success).toBe(false)
  })

  it('rejects float', () => {
    expect(FilmIdSchema.safeParse({ filmId: 1.5 }).success).toBe(false)
  })

  it('rejects string', () => {
    expect(FilmIdSchema.safeParse({ filmId: '1' }).success).toBe(false)
  })
})
