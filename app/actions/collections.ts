'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { collections } from '@/db/schema'

type Collection = typeof collections.$inferSelect

const CreateCollectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  blurb: z.string().max(500, 'Blurb must be 500 characters or fewer').optional(),
})

const CollectionFilmSchema = z.object({
  collectionId: z.number().int().positive(),
  filmId: z.number().int().positive(),
})

export async function createCollection(
  title: string,
  blurb?: string,
): Promise<{ data: Collection } | { error: string }> {
  const parsed = CreateCollectionSchema.safeParse({ title, blurb })
  if (!parsed.success) return { error: parsed.error.issues[0]!.message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('collections')
    .insert({ user_id: user.id, title: parsed.data.title, blurb: parsed.data.blurb ?? null })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: data as Collection }
}

export async function addFilmToCollection(
  collectionId: number,
  filmId: number,
): Promise<{ data: true } | { error: string }> {
  const parsed = CollectionFilmSchema.safeParse({ collectionId, filmId })
  if (!parsed.success) return { error: parsed.error.issues[0]!.message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Ownership check
  const { data: owned } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!owned) return { error: 'Collection not found or access denied' }

  // Get next position
  const { data: lastEntry } = await supabase
    .from('collection_films')
    .select('position')
    .eq('collection_id', collectionId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const position = lastEntry ? lastEntry.position + 1 : 0

  const { error } = await supabase
    .from('collection_films')
    .insert({ collection_id: collectionId, film_id: filmId, position })

  if (error) return { error: error.message }
  return { data: true as const }
}

export async function removeFilmFromCollection(
  collectionId: number,
  filmId: number,
): Promise<{ data: true } | { error: string }> {
  const parsed = CollectionFilmSchema.safeParse({ collectionId, filmId })
  if (!parsed.success) return { error: parsed.error.issues[0]!.message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Ownership check
  const { data: owned } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!owned) return { error: 'Collection not found or access denied' }

  const { error } = await supabase
    .from('collection_films')
    .delete()
    .eq('collection_id', collectionId)
    .eq('film_id', filmId)

  if (error) return { error: error.message }
  return { data: true as const }
}

export async function deleteCollection(
  collectionId: number,
): Promise<{ data: true } | { error: string }> {
  const parsed = z.number().int().positive().safeParse(collectionId)
  if (!parsed.success) return { error: 'Invalid collection ID' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Ownership check
  const { data: owned } = await supabase
    .from('collections')
    .select('id')
    .eq('id', collectionId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!owned) return { error: 'Collection not found or access denied' }

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { data: true as const }
}
