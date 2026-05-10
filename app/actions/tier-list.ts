'use server'
import { createClient } from '@/lib/supabase/server'
import { TierEntrySchema } from '@/lib/validation/schemas'

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

export async function reorderTierEntry(
  filmId: number,
  tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
  direction: 'left' | 'right',
): Promise<{ data: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: tierList } = await supabase
    .from('tier_lists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!tierList) return { error: 'No tier list found.' }

  const { data: entries, error: fetchError } = await supabase
    .from('tier_list_entries')
    .select('id, film_id, position')
    .eq('tier_list_id', (tierList as { id: number }).id)
    .eq('tier', tier)
    .order('position', { ascending: true })

  if (fetchError || !entries) return { error: 'Could not fetch tier entries.' }

  type Row = { id: number; film_id: number; position: number }
  const rows = entries as Row[]
  const idx = rows.findIndex((e) => e.film_id === filmId)
  if (idx === -1) return { error: 'Film not in this tier.' }

  const swapIdx = direction === 'left' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= rows.length) return { data: true as const }

  const cur = rows[idx]
  const swap = rows[swapIdx]

  const { error: e1 } = await supabase
    .from('tier_list_entries')
    .update({ position: swap.position })
    .eq('id', cur.id)
  if (e1) return { error: e1.message }

  const { error: e2 } = await supabase
    .from('tier_list_entries')
    .update({ position: cur.position })
    .eq('id', swap.id)
  if (e2) return { error: e2.message }

  return { data: true as const }
}

export async function getCurrentTierEntry(
  filmId: number,
): Promise<{ data: { tier: string } | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null }

  const { data: tierList } = await supabase
    .from('tier_lists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!tierList) return { data: null }

  const { data: entry } = await supabase
    .from('tier_list_entries')
    .select('tier')
    .eq('tier_list_id', (tierList as { id: number }).id)
    .eq('film_id', filmId)
    .maybeSingle()

  return { data: entry ? { tier: (entry as { tier: string }).tier } : null }
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
