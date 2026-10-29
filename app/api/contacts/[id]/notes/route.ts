import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import type { Contact } from "@/lib/types";
import { logActivity } from "@/lib/tasks";

type Ctx = { params: Promise<{ id: string }> };

// Add a note to a contact. Body: { text }
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => null);
  if (!input?.text) return NextResponse.json({ error: "Write something first." }, { status: 400 });
  const db = await readDb();
  const contact = (db.contacts as Contact[]).find((c) => c.id === id);
  if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
  contact.notes.unshift({ id: newId(), text: String(input.text), createdAt: new Date().toISOString() });
  logActivity(db, `Note added to ${contact.name}`, `/contacts/${contact.id}`);
  await writeDb(db);
  return NextResponse.json(contact, { status: 201 });
}
