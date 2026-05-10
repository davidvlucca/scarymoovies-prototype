import { describe, it, expect } from 'vitest'
import { scoreAnswers, getTopGenres } from '@/lib/pyf/scoring'
import type { Answer } from '@/lib/pyf/questions'

describe('scoreAnswers', () => {
  it('counts tags from a single answer', () => {
    const answer: Answer = { id: 'a', text: 'test', tags: ['supernatural', 'atmospheric'] }
    const scores = scoreAnswers([answer])
    expect(scores['supernatural']).toBe(1)
    expect(scores['atmospheric']).toBe(1)
    expect(scores['slasher']).toBeUndefined()
  })

  it('accumulates counts across multiple answers', () => {
    const answers: Answer[] = [
      { id: 'a', text: 'test', tags: ['supernatural'] },
      { id: 'b', text: 'test', tags: ['supernatural', 'gore'] },
    ]
    const scores = scoreAnswers(answers)
    expect(scores['supernatural']).toBe(2)
    expect(scores['gore']).toBe(1)
  })

  it('returns empty object for no answers', () => {
    expect(scoreAnswers([])).toEqual({})
  })
})

describe('getTopGenres', () => {
  it('returns genres for the highest-scoring tags', () => {
    // supernatural maps to ['Horror', 'Supernatural Horror']
    const scores = { supernatural: 3, slasher: 1 }
    const genres = getTopGenres(scores, 2)
    expect(genres).toContain('Horror')
    expect(genres.length).toBeGreaterThan(0)
  })

  it('deduplicates genres', () => {
    // supernatural -> ['Horror', 'Supernatural Horror'], slasher -> ['Slasher', 'Horror']
    // 'Horror' appears in both — should only be in result once
    const scores = { supernatural: 2, slasher: 1 }
    const genres = getTopGenres(scores, 5)
    const horrorCount = genres.filter(g => g === 'Horror').length
    expect(horrorCount).toBe(1)
  })

  it('returns empty array for empty scores', () => {
    expect(getTopGenres({}, 3)).toEqual([])
  })

  it('respects the topN limit', () => {
    // supernatural gives ['Horror', 'Supernatural Horror'], slasher gives ['Slasher', 'Horror']
    // With topN=1 we should get no more than 1 genre
    const scores = { supernatural: 3, slasher: 2 }
    const genres = getTopGenres(scores, 1)
    expect(genres.length).toBeLessThanOrEqual(1)
  })

  it('handles an unknown tag gracefully', () => {
    // Tags not in TAG_TO_GENRES map to [] — should not throw
    const scores = { unknowntag: 5 }
    expect(() => getTopGenres(scores, 3)).not.toThrow()
    expect(getTopGenres(scores, 3)).toEqual([])
  })
})
