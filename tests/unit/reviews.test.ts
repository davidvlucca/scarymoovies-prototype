import { describe, it, expect } from 'vitest'
import { ReviewSchema } from '@/lib/validation/schemas'

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
