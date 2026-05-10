'use client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { signOut } from '@/app/actions/auth'

function getInitials(user: User): string {
  const name = user.user_metadata?.full_name as string | undefined
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  return (user.email ?? 'SM').slice(0, 2).toUpperCase()
}

export function UserMenu({ user }: { user: User }) {
  const router = useRouter()
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initials = getInitials(user)

  async function handleSignOut() {
    const result = await signOut()
    router.push(result.redirectTo)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        aria-label="User menu"
      >
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={avatarUrl} alt={user.email ?? 'User avatar'} />
          <AvatarFallback className="bg-bg-elevated text-text-secondary text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push('/profile/me')}
        >
          View profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer"
          variant="destructive"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
