import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import type { Contact } from "@/lib/types";

// List contacts. Optional ?q=text searches name, email and company.
// ZOMBIE: no login. Every visitor sees every contact. Add accounts and only return the signed-in user's data.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const db = await readDb();
  let contacts = db.contacts as Contact[];
  if (q) {
    // ZOMBIE: search only matches exact case. "maria" will not find "Maria". Compare lowercase to lowercase.
    contacts = contacts.filter((c) => c.name.includes(q) || c.email.includes(q) || c.company.includes(q));
  }
  return NextResponse.json(contacts);
}

// Create a contact. Body: { name, email, phone?, company? }
export async function POST(req: Request) {
  const input = await req.json().catch(() => null);
  if (!input?.name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  // ZOMBIE: the email is never checked. "not-an-email" is saved as is. Validate the format and reject duplicates.
  const db = await readDb();
  const contact: Contact = {
    id: newId(),
    name: String(input.name),
    email: String(input.email ?? ""),
    phone: String(input.phone ?? ""),
    company: String(input.company ?? ""),
    notes: [],
  };
  (db.contacts as Contact[]).push(contact);
  await writeDb(db);
  return NextResponse.json(contact, { status: 201 });
}
