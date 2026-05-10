import Image from 'next/image'
import Link from 'next/link'
import type { users } from '@/db/schema'

type User = typeof users.$inferSelect

type Props = {
  profile: User
  isOwnProfile: boolean
}

export function ProfileHeader({ profile, isOwnProfile }: Props) {
  const initial = profile.username.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 flex-shrink-0">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              fill
              sizes="64px"
              className="object-cover rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center">
              <span className="text-text-primary text-xl font-bold select-none">{initial}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1 min-w-0 flex-1 pt-1">
          <h1 className="text-2xl font-bold text-text-primary">@{profile.username}</h1>
          {profile.bio && (
            <p className="text-text-secondary text-sm leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Edit button (own profile only) */}
        {isOwnProfile && (
          <div className="flex-shrink-0 pt-1">
            <Link
              href="/profile/me/edit"
              aria-disabled="true"
              tabIndex={-1}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-text-muted border border-border-subtle cursor-not-allowed opacity-60 pointer-events-none"
            >
              Edit Profile
            </Link>
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="h-px w-full bg-border-subtle" />
    </div>
  )
}
