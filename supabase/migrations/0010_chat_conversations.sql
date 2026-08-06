-- Split the assistant's single running chat log into separate conversations,
-- like Claude.ai's chat history.

create table if not exists chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_conversations_user_updated_idx
  on chat_conversations (user_id, updated_at desc);

alter table chat_conversations enable row level security;

create policy "chat_conversations_select_own" on chat_conversations
  for select using (auth.uid() = user_id);
create policy "chat_conversations_insert_own" on chat_conversations
  for insert with check (auth.uid() = user_id);
create policy "chat_conversations_update_own" on chat_conversations
  for update using (auth.uid() = user_id);
create policy "chat_conversations_delete_own" on chat_conversations
  for delete using (auth.uid() = user_id);

alter table chat_messages
  add column if not exists conversation_id uuid references chat_conversations (id) on delete cascade;

-- Bucket any pre-existing messages (from before conversations existed) into
-- one conversation per user so nothing is orphaned.
insert into chat_conversations (id, user_id, created_at, updated_at)
select gen_random_uuid(), user_id, min(created_at), max(created_at)
from chat_messages
where conversation_id is null
group by user_id;

update chat_messages m
set conversation_id = c.id
from chat_conversations c
where m.conversation_id is null
  and m.user_id = c.user_id;

alter table chat_messages alter column conversation_id set not null;

drop index if exists chat_messages_user_created_idx;
create index if not exists chat_messages_conversation_created_idx
  on chat_messages (conversation_id, created_at);
