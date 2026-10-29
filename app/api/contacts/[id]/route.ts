import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import type { Contact, Deal } from "@/lib/types";
import { getTasks, saveTasks, withBucket } from "@/lib/tasks";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const contact = (db.contacts as Contact[]).find((c) => c.id === id);
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const deals = (db.deals as Deal[]).filter((d) => d.contactId === id);
  const tasks = getTasks(db).filter((t) => t.contactId === id).map(withBucket);
  return NextResponse.json({ ...contact, deals, tasks });
}

// Edit a contact. Body can include name, email, phone, company.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => ({}));
  const db = await readDb();
  const contact = (db.contacts as Contact[]).find((c) => c.id === id);
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  for (const key of ["name", "email", "phone", "company"] as const) {
    if (typeof input[key] === "string") contact[key] = input[key]; // ZOMBIE: email not validated here either.
  }
  await writeDb(db);
  return NextResponse.json(contact);
}

// ZOMBIE: deletes right away. No confirmation, no undo, no soft delete, no roles (anyone can delete). Also no GDPR export or "forget me" flow.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  db.contacts = (db.contacts as Contact[]).filter((c) => c.id !== id) as typeof db.contacts;
  db.deals = (db.deals as Deal[]).filter((d) => d.contactId !== id) as typeof db.deals;
  saveTasks(db, getTasks(db).filter((t) => t.contactId !== id));
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
