-- Chat history for the personal assistant (Claude API + tool use over the
-- user's own tracker/finance/to-do data).

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx on chat_messages (user_id, created_at);

alter table chat_messages enable row level security;

create policy "chat_messages_select_own" on chat_messages
  for select using (auth.uid() = user_id);
create policy "chat_messages_insert_own" on chat_messages
  for insert with check (auth.uid() = user_id);
create policy "chat_messages_delete_own" on chat_messages
  for delete using (auth.uid() = user_id);
