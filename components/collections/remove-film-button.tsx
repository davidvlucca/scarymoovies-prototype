'use client'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { removeFilmFromCollection } from '@/app/actions/collections'

type Props = {
  collectionId: number
  filmId: number
  onRemoved?: () => void
}

export function RemoveFilmButton({ collectionId, filmId, onRemoved }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleRemove() {
    startTransition(async () => {
      const result = await removeFilmFromCollection(collectionId, filmId)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success('Film removed from collection')
        onRemoved?.()
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      aria-label="Remove from collection"
      className="shrink-0 px-2 py-1 rounded text-xs text-danger uppercase tracking-wide border border-danger/30 hover:bg-danger/10 transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none"
    >
      {isPending ? '…' : 'Remove'}
    </button>
  )
}
