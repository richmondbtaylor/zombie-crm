import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { getTasks, saveTasks, withBucket, logActivity } from "@/lib/tasks";

type Ctx = { params: Promise<{ id: string }> };

// Change a task. Body can include done, title, dueDate.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => ({}));
  const db = await readDb();
  const task = getTasks(db).find((t) => t.id === id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (typeof input.title === "string" && input.title) task.title = input.title;
  if (typeof input.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) task.dueDate = input.dueDate;
  if (typeof input.done === "boolean" && input.done !== task.done) {
    task.done = input.done;
    task.doneAt = input.done ? new Date().toISOString() : "";
    if (input.done) logActivity(db, `Task done: ${task.title}`, "/tasks");
  }
  await writeDb(db);
  return NextResponse.json(withBucket(task));
}

// ZOMBIE: deletes right away. No confirmation, no undo, and anyone can delete anyone's task.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  saveTasks(db, getTasks(db).filter((t) => t.id !== id));
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
