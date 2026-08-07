-- Support splitting a transaction's cost with other people. my_share is how
-- much of the total transaction.amount is actually the user's own expense
-- (null means the whole amount is theirs, i.e. no split). transaction_splits
-- holds each other person's name and portion.

alter table transactions add column if not exists my_share numeric;

create table if not exists transaction_splits (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  person_name text not null,
  amount numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists transaction_splits_transaction_idx on transaction_splits (transaction_id);

alter table transaction_splits enable row level security;

create policy "transaction_splits_select_own" on transaction_splits
  for select using (auth.uid() = user_id);
create policy "transaction_splits_insert_own" on transaction_splits
  for insert with check (auth.uid() = user_id);
create policy "transaction_splits_update_own" on transaction_splits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transaction_splits_delete_own" on transaction_splits
  for delete using (auth.uid() = user_id);
