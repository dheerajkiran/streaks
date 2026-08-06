-- Finance tracker: user-defined spending categories + logged transactions.

create table if not exists finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references finance_categories (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  place text,
  item text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_occurred_idx
  on transactions (user_id, occurred_on desc);

alter table finance_categories enable row level security;
alter table transactions enable row level security;

create policy "finance_categories_select_own" on finance_categories
  for select using (auth.uid() = user_id);
create policy "finance_categories_insert_own" on finance_categories
  for insert with check (auth.uid() = user_id);
create policy "finance_categories_delete_own" on finance_categories
  for delete using (auth.uid() = user_id);

create policy "transactions_select_own" on transactions
  for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on transactions
  for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions_delete_own" on transactions
  for delete using (auth.uid() = user_id);
