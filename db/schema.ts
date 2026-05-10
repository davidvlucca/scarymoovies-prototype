import {
  pgTable,
  serial,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  uniqueIndex,
  index,
  pgEnum,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const tierEnum = pgEnum('tier', ['S', 'A', 'B', 'C', 'D', 'E', 'F'])

export const users = pgTable('users', {
  id:         uuid('id').primaryKey(),
  username:   text('username').notNull().unique(),
  avatar_url: text('avatar_url'),
  bio:        text('bio'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const films = pgTable('films', {
  id:           serial('id').primaryKey(),
  tmdb_id:      integer('tmdb_id').notNull().unique(),
  title:        text('title').notNull(),
  year:         integer('year'),
  genre:        text('genre'),
  runtime:      integer('runtime'),
  poster_path:  text('poster_path'),
  backdrop_path: text('backdrop_path'),
  overview:     text('overview'),
  blurb:        text('blurb'),
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const ratings = pgTable('ratings', {
  id:         serial('id').primaryKey(),
  user_id:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  film_id:    integer('film_id').notNull().references(() => films.id, { onDelete: 'cascade' }),
  score:      numeric('score', { precision: 3, scale: 1 }).notNull(),
  tier:       tierEnum('tier'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('ratings_user_film_idx').on(t.user_id, t.film_id),
  index('ratings_film_idx').on(t.film_id),
  index('ratings_user_idx').on(t.user_id),
  check('score_range', sql`${t.score} >= 0 AND ${t.score} <= 5 AND ${t.score} * 2 = FLOOR(${t.score} * 2)`),
])

export const reviews = pgTable('reviews', {
  id:            serial('id').primaryKey(),
  user_id:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  film_id:       integer('film_id').notNull().references(() => films.id, { onDelete: 'cascade' }),
  body:          text('body').notNull(),
  helpful_count: integer('helpful_count').default(0).notNull(),
  created_at:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at:    timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('reviews_film_idx').on(t.film_id),
])

export const watchlistItems = pgTable('watchlist_items', {
  id:       serial('id').primaryKey(),
  user_id:  uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  film_id:  integer('film_id').notNull().references(() => films.id, { onDelete: 'cascade' }),
  added_at: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('watchlist_user_film_idx').on(t.user_id, t.film_id),
  index('watchlist_user_idx').on(t.user_id),
])

export const tierLists = pgTable('tier_lists', {
  id:         serial('id').primaryKey(),
  user_id:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const tierListEntries = pgTable('tier_list_entries', {
  id:           serial('id').primaryKey(),
  tier_list_id: integer('tier_list_id').notNull().references(() => tierLists.id, { onDelete: 'cascade' }),
  film_id:      integer('film_id').notNull().references(() => films.id, { onDelete: 'cascade' }),
  tier:         tierEnum('tier').notNull(),
  position:     integer('position').notNull(),
}, (t) => [
  uniqueIndex('tier_entries_list_film_idx').on(t.tier_list_id, t.film_id),
  index('tier_entries_list_idx').on(t.tier_list_id),
])

export const collections = pgTable('collections', {
  id:             serial('id').primaryKey(),
  user_id:        uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title:          text('title').notNull(),
  blurb:          text('blurb'),
  cover_film_ids: integer('cover_film_ids').array(),
  created_at:     timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at:     timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const collectionFilms = pgTable('collection_films', {
  id:            serial('id').primaryKey(),
  collection_id: integer('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  film_id:       integer('film_id').notNull().references(() => films.id, { onDelete: 'cascade' }),
  position:      integer('position').notNull(),
  editor_note:   text('editor_note'),
}, (t) => [
  uniqueIndex('collection_films_col_film_idx').on(t.collection_id, t.film_id),
  index('collection_films_col_idx').on(t.collection_id),
])

export const follows = pgTable('follows', {
  id:           serial('id').primaryKey(),
  follower_id:  uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  following_id: uuid('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  created_at:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('follows_pair_idx').on(t.follower_id, t.following_id),
  index('follows_following_idx').on(t.following_id),
  check('no_self_follow', sql`${t.follower_id} != ${t.following_id}`),
])
