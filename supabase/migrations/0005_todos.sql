-- Quick-capture to-do list: type something to remember, check it off when done.
-- Independent of trackers/entries - just a running list, not day- or year-scoped.

create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists todos_user_idx on todos (user_id);

alter table todos enable row level security;

create policy "todos_select_own" on todos
  for select using (auth.uid() = user_id);
create policy "todos_insert_own" on todos
  for insert with check (auth.uid() = user_id);
create policy "todos_update_own" on todos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "todos_delete_own" on todos
  for delete using (auth.uid() = user_id);
