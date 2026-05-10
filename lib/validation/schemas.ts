import { z } from 'zod'

export const RateSchema = z.object({
  filmId: z.number().int().positive(),
  score: z.number().min(0).max(5).refine(
    (v) => v * 2 === Math.floor(v * 2),
    { message: 'Score must be in 0.5 increments' },
  ),
  tier: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F']).optional(),
})

export const ReviewSchema = z.object({
  filmId: z.number().int().positive(),
  body: z
    .string()
    .min(1, 'Review cannot be empty')
    .max(5000, 'Review is too long'),
})

export const FilmIdSchema = z.object({
  filmId: z.number().int().positive(),
})

export const TierEntrySchema = z.object({
  filmId: z.number().int().positive(),
  tier: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F']),
})
