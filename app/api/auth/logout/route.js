import { NextResponse } from "next/server";

export function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("haven_session", "", { path: "/", maxAge: 0 });
  return res;
}
