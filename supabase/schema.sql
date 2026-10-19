-- Easy Travel schema
-- Run this in the Supabase SQL editor.

-- Visited countries (used by the Map page)
create table if not exists public.visited (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  country_code text not null,
  country_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, country_code)
);

-- Booked trips (used by the Booking page and My Trips)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id text not null,
  order_reference text,
  offer_id text not null,
  airline text,
  origin text not null,
  destination text not null,
  departure timestamptz,
  arrival timestamptz,
  price numeric not null,
  currency text not null,
  created_at timestamptz not null default now()
);

alter table public.visited enable row level security;
alter table public.bookings enable row level security;

create policy "Users manage own visited"
  on public.visited for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own bookings"
  on public.bookings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
