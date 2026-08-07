-- Pantry/inventory: food items on hand to eat or cook with. Foundation for a
-- future "what can I make with what I have" recommendation feature.

create table if not exists pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  category text,
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pantry_items_user_idx on pantry_items (user_id);

alter table pantry_items enable row level security;

create policy "pantry_items_select_own" on pantry_items
  for select using (auth.uid() = user_id);
create policy "pantry_items_insert_own" on pantry_items
  for insert with check (auth.uid() = user_id);
create policy "pantry_items_update_own" on pantry_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "pantry_items_delete_own" on pantry_items
  for delete using (auth.uid() = user_id);
