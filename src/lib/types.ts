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

export type TodoPriority = "low" | "medium" | "high";

export type Todo = {
  id: string;
  user_id: string;
  text: string;
  is_done: boolean;
  priority: TodoPriority | null;
  category: string | null;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
};

export type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
};

export type NotificationSettings = {
  user_id: string;
  enabled: boolean;
  reminder_hour: number;
  timezone: string;
  last_reminded_date: string | null;
  updated_at: string;
};

export type FinanceCategory = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  my_share: number | null;
  place: string | null;
  item: string | null;
  occurred_on: string;
  created_at: string;
};

export type SplitKind = "split" | "gift";

export type TransactionSplit = {
  id: string;
  transaction_id: string;
  user_id: string;
  person_name: string;
  amount: number;
  kind: SplitKind;
  created_at: string;
};

export type TransactionWithCategory = Transaction & {
  finance_categories: Pick<FinanceCategory, "id" | "name"> | null;
  transaction_splits: TransactionSplit[];
};

export type ChatRole = "user" | "assistant";

export type ChatConversation = {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  conversation_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
};
