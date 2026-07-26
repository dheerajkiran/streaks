export type TrackerType = "duration" | "quantity" | "time";

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
