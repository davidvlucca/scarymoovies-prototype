import { describe, it, expect } from 'vitest'
import { RateSchema } from '@/lib/validation/schemas'

describe('RateSchema', () => {
  it('accepts valid score and filmId', () => {
    expect(RateSchema.safeParse({ filmId: 1, score: 4.5 }).success).toBe(true)
  })

  it('accepts boundary scores 0 and 5', () => {
    expect(RateSchema.safeParse({ filmId: 1, score: 0 }).success).toBe(true)
    expect(RateSchema.safeParse({ filmId: 1, score: 5 }).success).toBe(true)
  })

  it('accepts missing tier (optional)', () => {
    expect(RateSchema.safeParse({ filmId: 1, score: 2.5 }).success).toBe(true)
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
