-- One-time setup for two new HelipadUSA features: Pilots For Hire and My Currency Tracker.
-- Run this once in the Supabase SQL Editor for the "janitorialmarket" project
-- (https://jjmbchgiocozfmywrhgo.supabase.co — shared with HelipadUSA and JanitorialMarket).
-- The site's code only ever uses the public anon key, which cannot create tables, so this
-- step has to be run manually by a project owner.

-- ── Pilots For Hire (helicopter-pilots-for-hire.html) ─────────────────────────
create table if not exists heli_pilots_for_hire (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  headline text not null,
  total_hours integer not null default 0,
  seeking_type text not null default 'Full Time',
  certificates text not null,
  location text not null,
  willing_to_relocate boolean not null default false,
  bio text not null,
  contact_email text not null,
  resume_url text,
  is_featured boolean not null default false,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table heli_pilots_for_hire enable row level security;

-- Anyone (including logged-out visitors) can browse published pilot profiles.
create policy "Public can read pilot profiles"
  on heli_pilots_for_hire for select
  using (true);

-- Only a logged-in user can create a profile, and only under their own user_id.
create policy "Users can insert their own pilot profile"
  on heli_pilots_for_hire for insert
  with check (auth.uid() = user_id);

-- Only the owning user can edit or delete their own profile.
create policy "Users can update their own pilot profile"
  on heli_pilots_for_hire for update
  using (auth.uid() = user_id);

create policy "Users can delete their own pilot profile"
  on heli_pilots_for_hire for delete
  using (auth.uid() = user_id);

-- ── My Currency Tracker (my-currency.html) ────────────────────────────────────
create table if not exists heli_pilot_currency (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  item_label text not null,
  due_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table heli_pilot_currency enable row level security;

-- This is personal data — only the owning user can see or touch their own rows.
create policy "Users can read their own currency items"
  on heli_pilot_currency for select
  using (auth.uid() = user_id);

create policy "Users can insert their own currency items"
  on heli_pilot_currency for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own currency items"
  on heli_pilot_currency for update
  using (auth.uid() = user_id);

create policy "Users can delete their own currency items"
  on heli_pilot_currency for delete
  using (auth.uid() = user_id);
