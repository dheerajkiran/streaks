-- Optional start/end wall-clock time for duration entries (e.g. "2:00 PM to 4:00 PM"),
-- so the entry log can show when an activity happened, not just its total minutes.
-- `value` (minutes) is still stored directly and stays the source of truth for the heatmap.

alter table entries add column if not exists start_time time;
alter table entries add column if not exists end_time time;
