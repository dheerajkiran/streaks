-- Rough self-tracked Claude API spend for the assistant, since Anthropic has
-- no public API to read back the prepaid credit balance. credited_usd is
-- entered manually by the user when they top up; spent_usd accumulates an
-- estimate from token usage on every assistant call.

create table if not exists assistant_usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  credited_usd numeric not null default 5,
  spent_usd numeric not null default 0,
  updated_at timestamptz not null default now()
);

alter table assistant_usage enable row level security;

create policy "assistant_usage_select_own" on assistant_usage
  for select using (auth.uid() = user_id);
create policy "assistant_usage_insert_own" on assistant_usage
  for insert with check (auth.uid() = user_id);
create policy "assistant_usage_update_own" on assistant_usage
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
