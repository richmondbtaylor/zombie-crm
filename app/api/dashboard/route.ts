import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { getTasks, getActivity, withBucket } from "@/lib/tasks";
import { STAGES, type Deal } from "@/lib/types";

// Everything the dashboard needs in one call.
export async function GET() {
  const db = await readDb();
  const deals = db.deals as Deal[];

  // Pipeline value for each stage.
  const perStage: Record<string, number> = {};
  for (const stage of STAGES) {
    perStage[stage] = deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + d.value, 0);
  }
  const openValue = perStage.Lead + perStage.Qualified + perStage.Proposal;

  // Deals won this month, going by the close date.
  const month = new Date().toISOString().slice(0, 7);
  const won = deals.filter((d) => d.stage === "Won" && (d.closeDate ?? "").startsWith(month));

  // ZOMBIE: "due today" and "overdue" use the server's date, not the user's timezone, and the tasks have no owner
  // so this list shows everyone's tasks. See lib/tasks.ts.
  const tasks = getTasks(db).map(withBucket);
  const dueToday = tasks.filter((t) => t.bucket === "today");
  const overdueCount = tasks.filter((t) => t.bucket === "overdue").length;

  return NextResponse.json({
    perStage,
    openValue,
    wonThisMonth: { count: won.length, value: won.reduce((sum, d) => sum + d.value, 0) },
    dueToday,
    overdueCount,
    recentActivity: getActivity(db).slice(0, 8),
  });
}
