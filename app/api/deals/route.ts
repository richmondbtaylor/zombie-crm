import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { STAGES, type Deal, type Stage } from "@/lib/types";
import { logActivity } from "@/lib/tasks";

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.deals);
}

// Create a deal. Body: { title, contactId, value, stage?, closeDate? }
export async function POST(req: Request) {
  const input = await req.json().catch(() => null);
  if (!input?.title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  const db = await readDb();
  const deal: Deal = {
    id: newId(),
    title: String(input.title),
    contactId: String(input.contactId ?? ""),
    value: Number(input.value) || 0,
    stage: STAGES.includes(input.stage) ? (input.stage as Stage) : "Lead",
    closeDate: /^\d{4}-\d{2}-\d{2}$/.test(String(input.closeDate ?? "")) ? String(input.closeDate) : "",
    notes: [],
  };
  (db.deals as Deal[]).push(deal);
  logActivity(db, `New deal: ${deal.title}`, `/deals/${deal.id}`);
  await writeDb(db);
  return NextResponse.json(deal, { status: 201 });
}
