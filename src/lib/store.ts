import { useEffect, useState, useCallback } from "react";

export type Priority = "high" | "medium" | "low";
export interface Task {
  id: string;
  title: string;
  deadline: string; // yyyy-mm-dd
  priority: Priority;
  hours: number;
  done: boolean;
}
export interface ChatMsg { id: string; role: "user" | "assistant"; content: string }

const uid = () => Math.random().toString(36).slice(2, 10);
export { uid };

function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const sampleTasks: Task[] = [
  { id: uid(), title: "Finalise Q4 budget proposal", deadline: inDays(1), priority: "high", hours: 3, done: false },
  { id: uid(), title: "Prepare client onboarding deck", deadline: inDays(3), priority: "high", hours: 4, done: false },
  { id: uid(), title: "Review team performance notes", deadline: inDays(5), priority: "medium", hours: 2, done: false },
  { id: uid(), title: "Update project documentation", deadline: inDays(6), priority: "low", hours: 2, done: false },
  { id: uid(), title: "Reply to vendor contract queries", deadline: inDays(2), priority: "medium", hours: 1, done: true },
];

export function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, [key]);
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
        return v;
      });
    },
    [key],
  );
  return [value, set, ready] as const;
}

export const useTasks = () => useLocal<Task[]>("wpa.tasks", sampleTasks);
export const useHours = () => useLocal<number>("wpa.hours", 25);
