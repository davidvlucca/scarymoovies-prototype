'use server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const TierEntrySchema = z.object({
  filmId: z.number().int().positive(),
  tier: z.enum(['S', 'A', 'B', 'C', 'D', 'E', 'F']),
})

async function getOrCreateTierList(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<{ id: number } | { error: string }> {
  const { data, error } = await supabase
    .from('tier_lists')
    .upsert({ user_id: userId }, { onConflict: 'user_id' })
    .select('id')
    .single()
  if (error || !data) return { error: 'Could not access tier list.' }
  return { id: data.id as number }
}

export async function addToTierList(
  filmId: number,
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
): Promise<{ data: { tier: string; position: number } } | { error: string }> {
  const parsed = TierEntrySchema.safeParse({ filmId, tier })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Rating gate: film must be rated before it can join the tier list
  const { data: rating } = await supabase
    .from('ratings')
    .select('id')
    .eq('user_id', user.id)
    .eq('film_id', filmId)
    .maybeSingle()
  if (!rating) return { error: 'Rate this film before adding it to your tier list.' }

  const tierList = await getOrCreateTierList(supabase, user.id)
  if ('error' in tierList) return tierList

  // Next position within the target tier
  const { data: maxRow } = await supabase
    .from('tier_list_entries')
    .select('position')
    .eq('tier_list_id', tierList.id)
    .eq('tier', tier)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  const position = maxRow ? (maxRow.position as number) + 1 : 0

  const { error } = await supabase
    .from('tier_list_entries')
    .upsert(
      { tier_list_id: tierList.id, film_id: filmId, tier, position },
      { onConflict: 'tier_list_id,film_id' },
    )
  if (error) return { error: error.message }
  return { data: { tier, position } }
}

// moveTierEntry is a tier change — same upsert logic
export async function moveTierEntry(
  filmId: number,
  newTier: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
): Promise<{ data: { tier: string; position: number } } | { error: string }> {
  return addToTierList(filmId, newTier)
}

export async function removeTierEntry(
  filmId: number,
): Promise<{ data: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: tierList } = await supabase
    .from('tier_lists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!tierList) return { data: true as const } // nothing to remove

  const { error } = await supabase
    .from('tier_list_entries')
    .delete()
    .eq('tier_list_id', tierList.id)
    .eq('film_id', filmId)
  if (error) return { error: error.message }
  return { data: true as const }
}
