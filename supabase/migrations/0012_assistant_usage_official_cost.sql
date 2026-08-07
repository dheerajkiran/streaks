-- Switch the assistant usage widget from a self-estimated token count to
-- Anthropic's official Cost API. credited_at marks when the current
-- credited_usd balance started being tracked (reset whenever the user
-- records a new top-up), and spend is fetched live from Anthropic since
-- that timestamp rather than accumulated locally.

alter table assistant_usage add column if not exists credited_at timestamptz not null default now();
alter table assistant_usage drop column if exists spent_usd;
