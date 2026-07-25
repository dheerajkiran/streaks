export type TrackerType = "duration" | "quantity";

export type Tracker = {
  id: string;
  user_id: string;
  name: string;
  type: TrackerType;
  unit: string | null;
  color: string;
  is_archived: boolean;
  created_at: string;
};

export type Entry = {
  id: string;
  user_id: string;
  tracker_id: string;
  entry_date: string;
  value: number;
  note: string | null;
  created_at: string;
};

export type DailyTotal = {
  date: string;
  total: number;
};
