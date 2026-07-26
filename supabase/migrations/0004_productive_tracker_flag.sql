-- Marks which trackers count toward the "Productivity" aggregate view
-- (e.g. Work, Studying, upskilling) as opposed to leisure trackers
-- (Games, Family Time, etc.) that shouldn't be lumped into it.

alter table trackers add column if not exists is_productive boolean not null default false;
