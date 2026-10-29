import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { logActivity } from "@/lib/tasks";
import type { Deal } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// Add a note to a deal. Body: { text }
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => null);
  if (!input?.text) return NextResponse.json({ error: "Write something first." }, { status: 400 });
  const db = await readDb();
  const deal = (db.deals as Deal[]).find((d) => d.id === id);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!deal.notes) deal.notes = [];
  deal.notes.unshift({ id: newId(), text: String(input.text), createdAt: new Date().toISOString() });
  logActivity(db, `Note added to deal: ${deal.title}`, `/deals/${deal.id}`);
  await writeDb(db);
  return NextResponse.json(deal, { status: 201 });
}
