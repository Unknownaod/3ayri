// app/api/status/route.js — public. Runs the checks (at most once a minute) and returns the current state. The bot also calls this every few minutes so the history has no gaps.
import { NextResponse } from "next/server";
import { current, overall } from "@/lib/status";
import { safe } from "@/lib/api";

export const dynamic = "force-dynamic";
export const GET = safe("status", async () => {
  const c = await current();
  return NextResponse.json({ at: c.at, overall: overall(c.items), items: c.items }, { headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" } });
});
