export type TrackerType = "duration" | "quantity" | "time";

/** Sentinel value for the aggregate "Productivity" heatmap view, not a real tracker id. */
export const PRODUCTIVITY_TRACKER_ID = "__productivity__";

export type Tracker = {
  id: string;
  user_id: string;
  name: string;
  type: TrackerType;
  unit: string | null;
  color: string;
  is_archived: boolean;
  is_productive: boolean;
  created_at: string;
};

export type Entry = {
  id: string;
  user_id: string;
  tracker_id: string;
  entry_date: string;
  value: number;
  note: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
};

export type DailyTotal = {
  date: string;
  total: number;
};
