-- Mnemo initial schema.
-- Run this in your Supabase project: Dashboard → SQL Editor → paste → Run.

-- ============================================================
-- Tables
-- ============================================================

create table public.decks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  source_pdf_path text,
  created_at      timestamptz not null default now()
);

create index decks_user_id_idx on public.decks(user_id);

create type public.card_type as enum ('definition', 'concept', 'comparison', 'cloze');

create table public.cards (
  id          uuid primary key default gen_random_uuid(),
  deck_id     uuid not null references public.decks(id) on delete cascade,
  type        public.card_type not null,
  question    text not null,
  answer      text not null,
  source_page integer,
  created_at  timestamptz not null default now()
);

create index cards_deck_id_idx on public.cards(deck_id);

create table public.reviews (
  id              uuid primary key default gen_random_uuid(),
  card_id         uuid not null references public.cards(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  quality         smallint not null check (quality between 0 and 5),
  ease_factor     real not null,
  interval_days   integer not null,
  repetitions     integer not null,
  reviewed_at     timestamptz not null default now(),
  next_review_at  timestamptz not null
);

create index reviews_user_next_idx on public.reviews(user_id, next_review_at);
create index reviews_card_idx      on public.reviews(card_id);

-- ============================================================
-- Row-Level Security
-- ============================================================

alter table public.decks   enable row level security;
alter table public.cards   enable row level security;
alter table public.reviews enable row level security;

-- Decks: owner-only.
create policy "decks_owner_all" on public.decks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Cards: accessible iff the parent deck is owned by the current user.
create policy "cards_owner_all" on public.cards
  for all using (
    exists (select 1 from public.decks d where d.id = cards.deck_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.decks d where d.id = cards.deck_id and d.user_id = auth.uid())
  );

-- Reviews: owner-only.
create policy "reviews_owner_all" on public.reviews
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Storage bucket for PDFs
-- ============================================================

insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

-- Authenticated users can upload to their own folder: pdfs/<user_id>/...
create policy "pdfs_owner_rw" on storage.objects
  for all
  using (
    bucket_id = 'pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'pdfs'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
