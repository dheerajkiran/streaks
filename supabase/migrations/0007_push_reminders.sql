-- Push notification reminders: one row per subscribed device, plus a
-- single settings row per user (reminder hour, timezone, last-sent tracking
-- so the hourly cron doesn't re-notify the same day).

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_select_own" on push_subscriptions
  for select using (auth.uid() = user_id);
create policy "push_subscriptions_insert_own" on push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "push_subscriptions_update_own" on push_subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_subscriptions_delete_own" on push_subscriptions
  for delete using (auth.uid() = user_id);

create table if not exists notification_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  enabled boolean not null default true,
  reminder_hour integer not null default 18 check (reminder_hour >= 0 and reminder_hour <= 23),
  timezone text not null default 'UTC',
  last_reminded_date date,
  updated_at timestamptz not null default now()
);

alter table notification_settings enable row level security;

create policy "notification_settings_select_own" on notification_settings
  for select using (auth.uid() = user_id);
create policy "notification_settings_insert_own" on notification_settings
  for insert with check (auth.uid() = user_id);
create policy "notification_settings_update_own" on notification_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
