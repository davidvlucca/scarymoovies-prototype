CREATE TYPE "public"."tier" AS ENUM('S', 'A', 'B', 'C', 'D', 'E', 'F');--> statement-breakpoint
CREATE TABLE "collection_films" (
	"id" serial PRIMARY KEY NOT NULL,
	"collection_id" integer NOT NULL,
	"film_id" integer NOT NULL,
	"position" integer NOT NULL,
	"editor_note" text
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"blurb" text,
	"cover_film_ids" integer[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "films" (
	"id" serial PRIMARY KEY NOT NULL,
	"tmdb_id" integer NOT NULL,
	"title" text NOT NULL,
	"year" integer,
	"genre" text,
	"runtime" integer,
	"poster_path" text,
	"backdrop_path" text,
	"overview" text,
	"blurb" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "films_tmdb_id_unique" UNIQUE("tmdb_id")
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "no_self_follow" CHECK ("follows"."follower_id" != "follows"."following_id")
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"film_id" integer NOT NULL,
	"score" numeric(3, 1) NOT NULL,
	"tier" "tier",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "score_range" CHECK ("ratings"."score" >= 0 AND "ratings"."score" <= 5 AND "ratings"."score" * 2 = FLOOR("ratings"."score" * 2))
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"film_id" integer NOT NULL,
	"body" text NOT NULL,
	"helpful_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tier_list_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"tier_list_id" integer NOT NULL,
	"film_id" integer NOT NULL,
	"tier" "tier" NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tier_lists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tier_lists_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"avatar_url" text,
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "watchlist_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"film_id" integer NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collection_films" ADD CONSTRAINT "collection_films_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_films" ADD CONSTRAINT "collection_films_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tier_list_entries" ADD CONSTRAINT "tier_list_entries_tier_list_id_tier_lists_id_fk" FOREIGN KEY ("tier_list_id") REFERENCES "public"."tier_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tier_list_entries" ADD CONSTRAINT "tier_list_entries_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tier_lists" ADD CONSTRAINT "tier_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_film_id_films_id_fk" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "collection_films_col_film_idx" ON "collection_films" USING btree ("collection_id","film_id");--> statement-breakpoint
CREATE INDEX "collection_films_col_idx" ON "collection_films" USING btree ("collection_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_pair_idx" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "follows_following_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ratings_user_film_idx" ON "ratings" USING btree ("user_id","film_id");--> statement-breakpoint
CREATE INDEX "ratings_film_idx" ON "ratings" USING btree ("film_id");--> statement-breakpoint
CREATE INDEX "ratings_user_idx" ON "ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_film_idx" ON "reviews" USING btree ("film_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tier_entries_list_film_idx" ON "tier_list_entries" USING btree ("tier_list_id","film_id");--> statement-breakpoint
CREATE INDEX "tier_entries_list_idx" ON "tier_list_entries" USING btree ("tier_list_id");--> statement-breakpoint
CREATE UNIQUE INDEX "watchlist_user_film_idx" ON "watchlist_items" USING btree ("user_id","film_id");--> statement-breakpoint
CREATE INDEX "watchlist_user_idx" ON "watchlist_items" USING btree ("user_id");