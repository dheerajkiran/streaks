-- Distinguish a real split (the other person owes you back, so it's
-- subtracted from your own share) from a gift (you're covering their
-- portion on purpose, so it still counts as your own spending).

alter table transaction_splits
  add column if not exists kind text not null default 'split' check (kind in ('split', 'gift'));
