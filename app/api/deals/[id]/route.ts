import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { STAGES, type Contact, type Deal } from "@/lib/types";
import { getTasks, logActivity, withBucket } from "@/lib/tasks";

type Ctx = { params: Promise<{ id: string }> };

// One deal with its contact and tasks.
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const deal = (db.deals as Deal[]).find((d) => d.id === id);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const contact = (db.contacts as Contact[]).find((c) => c.id === deal.contactId) ?? null;
  const tasks = getTasks(db).filter((t) => t.dealId === id).map(withBucket);
  return NextResponse.json({ ...deal, notes: deal.notes ?? [], contact, tasks });
}

// Change a deal's stage, title, value, close date or contact.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => ({}));
  const db = await readDb();
  const deal = (db.deals as Deal[]).find((d) => d.id === id);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (STAGES.includes(input.stage) && input.stage !== deal.stage) {
    deal.stage = input.stage;
    // A deal moved to Won with no close date gets today's date.
    if (deal.stage === "Won" && !deal.closeDate) deal.closeDate = new Date().toISOString().slice(0, 10);
    logActivity(db, `${deal.title} moved to ${deal.stage}`, `/deals/${deal.id}`);
  }
  if (typeof input.closeDate === "string" && (input.closeDate === "" || /^\d{4}-\d{2}-\d{2}$/.test(input.closeDate))) deal.closeDate = input.closeDate;
  if (typeof input.contactId === "string") deal.contactId = input.contactId;
  if (typeof input.title === "string") deal.title = input.title;
  if (input.value !== undefined) deal.value = Number(input.value) || 0;
  await writeDb(db);
  return NextResponse.json(deal);
}

// ZOMBIE: deletes right away. No confirmation and no undo.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  db.deals = (db.deals as Deal[]).filter((d) => d.id !== id) as typeof db.deals;
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
