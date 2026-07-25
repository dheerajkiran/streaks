-- Third tracker type: a single point-in-time event (e.g. "Wake up time"),
-- logged as a clock time rather than a duration or quantity.

alter table trackers drop constraint trackers_type_check;
alter table trackers add constraint trackers_type_check
  check (type in ('duration', 'quantity', 'time'));

-- Time-type entries store minutes-since-midnight as `value` (for the heatmap)
-- and the actual clock time in `start_time`; midnight (0) is a valid time.
alter table entries drop constraint entries_value_check;
alter table entries add constraint entries_value_check check (value >= 0);
