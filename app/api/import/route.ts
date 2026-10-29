import { NextResponse } from "next/server";

// ZOMBIE: CSV import is not built. Parse the file, check each email, skip duplicates, and show a summary.
export async function POST() {
  return NextResponse.json({ error: "Not built yet, see ZOMBIE.md" }, { status: 501 });
}
