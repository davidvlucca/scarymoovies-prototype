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
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-4 md:gap-6">
        {/* Avatar */}
        <div className="relative w-14 h-14 md:w-20 md:h-20 flex-shrink-0">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              fill
              sizes="(max-width: 768px) 56px, 80px"
              className="object-cover rounded-full"
            />
          ) : (
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-bg-elevated flex items-center justify-center border border-border-subtle">
              <span className="text-text-primary text-xl md:text-2xl font-black select-none uppercase">{initial}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-2 min-w-0 flex-1 pt-1">
          <p className="text-xs uppercase tracking-widest text-text-muted">Profile</p>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-text-primary leading-none break-all">
            @{profile.username}
          </h1>
          {profile.bio && (
            <p className="text-text-secondary text-sm leading-relaxed mt-1">{profile.bio}</p>
          )}
        </div>

        {/* Edit button (own profile only) */}
        {isOwnProfile && (
          <div className="flex-shrink-0 pt-1">
            <Link
              href="/profile/me/edit"
              aria-disabled="true"
              tabIndex={-1}
              className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium text-text-muted border border-border-subtle cursor-not-allowed opacity-60 pointer-events-none uppercase tracking-widest"
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
