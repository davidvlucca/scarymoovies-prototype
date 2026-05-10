import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Mirror of the RateSchema in app/actions/ratings.ts
const RateSchema = z.object({
  filmId: z.number().int().positive(),
  score: z.number().min(0).max(5).refine(
    (v) => v * 2 === Math.floor(v * 2),
    { message: 'Score must be in 0.5 increments' },
  ),
  tier: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F']).optional(),
})

describe('RateSchema validation', () => {
  it('accepts valid score and filmId', () => {
    expect(RateSchema.safeParse({ filmId: 1, score: 4.5 }).success).toBe(true)
  })

  it('accepts score of 0', () => {
    expect(RateSchema.safeParse({ filmId: 1, score: 0 }).success).toBe(true)
  })

  it('accepts score of 5', () => {
    expect(RateSchema.safeParse({ filmId: 1, score: 5 }).success).toBe(true)
  })

  it('rejects non-0.5-increment scores', () => {
    expect(RateSchema.safeParse({ filmId: 1, score: 3.3 }).success).toBe(false)
  })

  it('rejects score above 5', () => {
    expect(RateSchema.safeParse({ filmId: 1, score: 5.5 }).success).toBe(false)
  })

  it('rejects score below 0', () => {
    expect(RateSchema.safeParse({ filmId: 1, score: -0.5 }).success).toBe(false)
  })

  it('rejects negative filmId', () => {
    expect(RateSchema.safeParse({ filmId: -1, score: 3.0 }).success).toBe(false)
  })

  it('accepts all valid tier values', () => {
    for (const tier of ['S', 'A', 'B', 'C', 'D', 'E', 'F'] as const) {
      expect(RateSchema.safeParse({ filmId: 1, score: 3.0, tier }).success).toBe(true)
    }
  })

  it('rejects invalid tier', () => {
    expect(RateSchema.safeParse({ filmId: 1, score: 3.0, tier: 'X' }).success).toBe(false)
  })
})
