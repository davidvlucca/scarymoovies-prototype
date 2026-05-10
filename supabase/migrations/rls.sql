-- Enable RLS on all tables
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.films             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_lists        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_list_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_films  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows           ENABLE ROW LEVEL SECURITY;

-- films: public read, no writes via RLS (seeder uses service role)
CREATE POLICY "films_select_public"
  ON public.films FOR SELECT TO anon, authenticated USING (true);

-- users: public read, own row update only
CREATE POLICY "users_select_public"
  ON public.users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ratings: public read; own rows insert/update/delete
CREATE POLICY "ratings_select_public"
  ON public.ratings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "ratings_insert_own"
  ON public.ratings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_update_own"
  ON public.ratings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_delete_own"
  ON public.ratings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- reviews: public read; own rows insert/update/delete
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own"
  ON public.reviews FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_delete_own"
  ON public.reviews FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- watchlist_items: own rows only (private)
CREATE POLICY "watchlist_select_own"
  ON public.watchlist_items FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "watchlist_insert_own"
  ON public.watchlist_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_delete_own"
  ON public.watchlist_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- tier_lists: public read; own row insert/update/delete
CREATE POLICY "tier_lists_select_public"
  ON public.tier_lists FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tier_lists_insert_own"
  ON public.tier_lists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tier_lists_update_own"
  ON public.tier_lists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tier_lists_delete_own"
  ON public.tier_lists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- tier_list_entries: public read; write only if caller owns parent tier_list
CREATE POLICY "tier_entries_select_public"
  ON public.tier_list_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tier_entries_insert_own"
  ON public.tier_list_entries FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.tier_lists WHERE id = tier_list_id)
  );
CREATE POLICY "tier_entries_update_own"
  ON public.tier_list_entries FOR UPDATE TO authenticated
  USING (auth.uid() = (SELECT user_id FROM public.tier_lists WHERE id = tier_list_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.tier_lists WHERE id = tier_list_id));
CREATE POLICY "tier_entries_delete_own"
  ON public.tier_list_entries FOR DELETE TO authenticated
  USING (auth.uid() = (SELECT user_id FROM public.tier_lists WHERE id = tier_list_id));

-- collections: public read; own rows write
CREATE POLICY "collections_select_public"
  ON public.collections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "collections_insert_own"
  ON public.collections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_update_own"
  ON public.collections FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_delete_own"
  ON public.collections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- collection_films: public read; write only if caller owns parent collection
CREATE POLICY "collection_films_select_public"
  ON public.collection_films FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "collection_films_insert_own"
  ON public.collection_films FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id)
  );
CREATE POLICY "collection_films_update_own"
  ON public.collection_films FOR UPDATE TO authenticated
  USING (auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id));
CREATE POLICY "collection_films_delete_own"
  ON public.collection_films FOR DELETE TO authenticated
  USING (auth.uid() = (SELECT user_id FROM public.collections WHERE id = collection_id));

-- follows: public read; own rows write
CREATE POLICY "follows_select_public"
  ON public.follows FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "follows_insert_own"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);
