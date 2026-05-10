'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createCollection } from '@/app/actions/collections'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  blurb: z.string().max(500, 'Blurb must be 500 characters or fewer').optional(),
})

type FormData = z.infer<typeof schema>

export function NewCollectionForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const result = await createCollection(data.title, data.blurb || undefined)
      if ('error' in result) {
        toast.error(result.error)
        return
      }
      toast.success('Collection created')
      router.push(`/collections/${result.data.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-1.5">
        <Label
          htmlFor="title"
          className="text-text-secondary text-xs uppercase tracking-wide"
        >
          Title <span className="text-danger">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="e.g. Best Slashers of the 80s"
          autoComplete="off"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-xs text-danger">{errors.title.message}</p>
        )}
      </div>

      {/* Blurb */}
      <div className="space-y-1.5">
        <Label
          htmlFor="blurb"
          className="text-text-secondary text-xs uppercase tracking-wide"
        >
          Description <span className="text-text-muted">(optional)</span>
        </Label>
        <textarea
          id="blurb"
          rows={4}
          placeholder="What makes this list worth watching…"
          className="w-full rounded-lg border border-border-subtle bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors duration-150"
          {...register('blurb')}
        />
        {errors.blurb && (
          <p className="text-xs text-danger">{errors.blurb.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="px-6">
          {isPending ? 'Creating…' : 'Create List'}
        </Button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-text-muted hover:text-text-secondary transition-colors duration-150"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
