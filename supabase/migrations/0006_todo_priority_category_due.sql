-- Lets to-dos be segregated by importance (priority), a free-text group
-- (category, e.g. "Work"/"Personal"/"Urgent"), and an optional deadline.

alter table todos add column if not exists priority text check (priority in ('low', 'medium', 'high'));
alter table todos add column if not exists category text;
alter table todos add column if not exists due_date date;
