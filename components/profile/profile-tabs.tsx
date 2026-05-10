'use client'

import { useState } from 'react'
import { ReviewsTab } from './reviews-tab'
import { WatchlistTab } from './watchlist-tab'
import { CollectionsTab } from './collections-tab'
import { TierListTab } from './tier-list-tab'
import type { reviews, watchlistItems, films, collections, tierListEntries } from '@/db/schema'

type Review = typeof reviews.$inferSelect
type WatchlistItem = typeof watchlistItems.$inferSelect
type Film = typeof films.$inferSelect
type Collection = typeof collections.$inferSelect
type WatchlistEntry = WatchlistItem & { film: Film }

type TierListEntryRow = typeof tierListEntries.$inferSelect
type TierEntry = TierListEntryRow & { film: Film }

type OwnProfileProps = {
  isOwnProfile: true
  reviews: Review[]
  watchlistWithFilms: WatchlistEntry[]
  collections: Collection[]
  tierEntries: TierEntry[]
}

type PublicProfileProps = {
  isOwnProfile: false
  reviews: Review[]
  collections: Collection[]
  tierEntries: TierEntry[]
}

type Props = OwnProfileProps | PublicProfileProps

type OwnTab = 'reviews' | 'watchlist' | 'collections' | 'tier-list'
type PublicTab = 'reviews' | 'collections' | 'tier-list'

const OWN_TABS: { id: OwnTab; label: string }[] = [
  { id: 'reviews', label: 'Reviews' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'collections', label: 'Collections' },
  { id: 'tier-list', label: 'Tier List' },
]

const PUBLIC_TABS: { id: PublicTab; label: string }[] = [
  { id: 'reviews', label: 'Reviews' },
  { id: 'collections', label: 'Collections' },
  { id: 'tier-list', label: 'Tier List' },
]

export function ProfileTabs(props: Props) {
  const [activeTab, setActiveTab] = useState<string>(
    props.isOwnProfile ? 'reviews' : 'reviews'
  )

  const tabs = props.isOwnProfile ? OWN_TABS : PUBLIC_TABS

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar — scrollable on mobile */}
      <div className="flex border-b border-border-subtle overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px whitespace-nowrap shrink-0',
                isActive
                  ? 'border-accent text-text-primary'
                  : 'border-transparent text-text-muted hover:text-text-secondary',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'reviews' && (
          <ReviewsTab reviews={props.reviews} />
        )}

        {activeTab === 'watchlist' && props.isOwnProfile && (
          <WatchlistTab watchlistWithFilms={props.watchlistWithFilms} />
        )}

        {activeTab === 'collections' && (
          <CollectionsTab collections={props.collections} />
        )}

        {activeTab === 'tier-list' && (
          <TierListTab entries={props.tierEntries} isOwner={props.isOwnProfile} />
        )}
      </div>
    </div>
  )
}
