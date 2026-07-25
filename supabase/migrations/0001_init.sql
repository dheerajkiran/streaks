-- Activity Tracker schema: user-defined trackers + logged entries.
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create table if not exists trackers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('duration', 'quantity')),
  unit text,
  color text not null default '#22c55e',
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tracker_id uuid not null references trackers (id) on delete cascade,
  entry_date date not null default current_date,
  value numeric not null check (value > 0),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists entries_tracker_date_idx on entries (tracker_id, entry_date);
create index if not exists trackers_user_idx on trackers (user_id);

alter table trackers enable row level security;
alter table entries enable row level security;

create policy "trackers_select_own" on trackers
  for select using (auth.uid() = user_id);
create policy "trackers_insert_own" on trackers
  for insert with check (auth.uid() = user_id);
create policy "trackers_update_own" on trackers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "trackers_delete_own" on trackers
  for delete using (auth.uid() = user_id);

create policy "entries_select_own" on entries
  for select using (auth.uid() = user_id);
create policy "entries_insert_own" on entries
  for insert with check (auth.uid() = user_id);
create policy "entries_update_own" on entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "entries_delete_own" on entries
  for delete using (auth.uid() = user_id);
