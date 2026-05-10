import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const ReviewSchema = z.object({
  filmId: z.number().int().positive(),
  body: z.string().min(1, 'Review cannot be empty').max(5000, 'Review is too long'),
})

describe('ReviewSchema', () => {
  it('accepts valid review', () => {
    expect(ReviewSchema.safeParse({ filmId: 1, body: 'Terrifying.' }).success).toBe(true)
  })

  it('rejects empty body', () => {
    expect(ReviewSchema.safeParse({ filmId: 1, body: '' }).success).toBe(false)
  })

  it('rejects body over 5000 chars', () => {
    expect(ReviewSchema.safeParse({ filmId: 1, body: 'a'.repeat(5001) }).success).toBe(false)
  })

  it('accepts body of exactly 5000 chars', () => {
    expect(ReviewSchema.safeParse({ filmId: 1, body: 'a'.repeat(5000) }).success).toBe(true)
  })
})
