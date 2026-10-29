import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { getTasks, saveTasks, withBucket, logActivity } from "@/lib/tasks";
import type { Task } from "@/lib/types";

// List tasks. Optional ?contactId= or ?dealId= to filter. Each task comes back with a bucket (overdue, today, upcoming, done).
// ZOMBIE: no login and no owner. Every visitor gets every task, and the buckets use the server's date, not the user's timezone (see lib/tasks.ts).
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const contactId = params.get("contactId");
  const dealId = params.get("dealId");
  const db = await readDb();
  let tasks = getTasks(db);
  if (contactId) tasks = tasks.filter((t) => t.contactId === contactId);
  if (dealId) tasks = tasks.filter((t) => t.dealId === dealId);
  tasks = [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return NextResponse.json(tasks.map(withBucket));
}

// Create a task. Body: { title, dueDate: "YYYY-MM-DD", contactId?, dealId? }
export async function POST(req: Request) {
  const input = await req.json().catch(() => null);
  if (!input?.title) return NextResponse.json({ error: "Give the task a title." }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.dueDate ?? ""))) {
    return NextResponse.json({ error: "Pick a due date." }, { status: 400 });
  }
  const db = await readDb();
  const task: Task = {
    id: newId(),
    title: String(input.title),
    dueDate: String(input.dueDate),
    contactId: String(input.contactId ?? ""),
    dealId: String(input.dealId ?? ""),
    done: false,
  };
  saveTasks(db, [...getTasks(db), task]);
  logActivity(db, `New task: ${task.title}`, "/tasks");
  await writeDb(db);
  return NextResponse.json(withBucket(task), { status: 201 });
}
