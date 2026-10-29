import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { STAGES, type Deal } from "@/lib/types";

// Money per stage, plus the total pipeline value.
export async function GET() {
  const db = await readDb();
  const deals = db.deals as Deal[];

  const perStage: Record<string, number> = {};
  for (const stage of STAGES) {
    perStage[stage] = deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + d.value, 0);
  }

  // ZOMBIE: "Lost" deals still count in the pipeline total. Lost money is not pipeline. Leave Lost (and probably Won) out.
  const pipelineTotal = deals.reduce((sum, d) => sum + d.value, 0);

  return NextResponse.json({ perStage, pipelineTotal });
}
