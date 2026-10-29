import { newId } from "@/lib/db";
import type { Db } from "@/lib/db";
import type { ActivityLine, Task, TaskWithBucket } from "@/lib/types";

// Put a task in overdue, today, upcoming or done.
// ZOMBIE: "today" is the SERVER's date (UTC on Vercel), not the user's timezone. Someone in Miami at 9pm is
// already in "tomorrow" on the server, so their tasks flip to overdue (or stay hidden) at the wrong time.
// Send the user's timezone (or their local date) with the request and compare against that.
export function withBucket(task: Task): TaskWithBucket {
  const today = new Date().toISOString().slice(0, 10);
  let bucket: TaskWithBucket["bucket"] = "upcoming";
  if (task.done) bucket = "done";
  else if (task.dueDate < today) bucket = "overdue";
  else if (task.dueDate === today) bucket = "today";
  return { ...task, bucket };
}

export function getTasks(db: Db): Task[] {
  return ((db as unknown as { tasks?: Task[] }).tasks ?? []);
}

export function saveTasks(db: Db, tasks: Task[]) {
  (db as unknown as { tasks: Task[] }).tasks = tasks;
}

// Add a line to the recent activity feed (newest first, keep the last 30).
export function logActivity(db: Db, text: string, href?: string) {
  const holder = db as unknown as { activity?: ActivityLine[] };
  const list = holder.activity ?? [];
  list.unshift({ id: newId() + Math.floor(Math.random() * 1000), text, at: new Date().toISOString(), ...(href ? { href } : {}) });
  holder.activity = list.slice(0, 30);
}

export function getActivity(db: Db): ActivityLine[] {
  return (db as unknown as { activity?: ActivityLine[] }).activity ?? [];
}
