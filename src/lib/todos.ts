import type { Todo, TodoPriority } from "@/lib/types";

export const PRIORITY: Record<TodoPriority, { label: string; color: string }> = {
  high: { label: "High", color: "#e34948" },
  medium: { label: "Medium", color: "#eb6834" },
  low: { label: "Low", color: "#2a78d6" },
};

const PRIORITY_RANK: Record<TodoPriority, number> = { high: 3, medium: 2, low: 1 };

export function sortTodos(todos: Todo[]) {
  return [...todos].sort((a, b) => {
    const rankDiff =
      (b.priority ? PRIORITY_RANK[b.priority] : 0) - (a.priority ? PRIORITY_RANK[a.priority] : 0);
    if (rankDiff !== 0) return rankDiff;
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return a.created_at.localeCompare(b.created_at);
  });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
